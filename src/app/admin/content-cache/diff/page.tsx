'use client';

import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/auth/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useQuery } from '@tanstack/react-query';
import { getAuthHeaders } from '@/hooks/useApi';
import Link from 'next/link';
import { FileText, AlertCircle, Upload, GitCompareArrows } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

const ENTITY_TYPES = [
  'drivers',
  'carparts',
  'boosts',
  'collections',
  'trackAILoadouts',
  'series',
  'trackData',
] as const;

type EntityType = (typeof ENTITY_TYPES)[number];

type FieldTypeMap = Record<string, string>;

interface StructuralDiff {
  addedFields: string[];
  removedFields: string[];
  typeChanges: { field: string; before: string; after: string }[];
  hasChanges: boolean;
}

interface FieldDiff {
  field: string;
  before: unknown;
  after: unknown;
}

interface ModifiedItem {
  id: string;
  name?: string;
  fieldDiffs: FieldDiff[];
}

interface EntityDataDiff {
  added: Record<string, unknown>[];
  removed: Record<string, unknown>[];
  modified: ModifiedItem[];
  unchanged: number;
}

interface DiffReport {
  structural: Record<EntityType, StructuralDiff>;
  data: Record<EntityType, EntityDataDiff>;
  hasAnyStructuralChanges: boolean;
}

// ---------------------------------------------------------------------------
// Diff logic
// ---------------------------------------------------------------------------

function parseContentCache(raw: unknown): Record<EntityType, Record<string, unknown>[]> {
  if (typeof raw !== 'object' || raw === null) throw new Error('Invalid JSON: expected an object');

  const obj = raw as Record<string, unknown>;
  const source =
    typeof obj._contentResponse === 'object' && obj._contentResponse !== null
      ? (obj._contentResponse as Record<string, unknown>)
      : obj;

  const get = (key: string): Record<string, unknown>[] => {
    const val = source[key];
    if (!Array.isArray(val)) return [];
    return val as Record<string, unknown>[];
  };

  return {
    drivers: get('drivers'),
    carparts: get('carparts'),
    boosts: get('boosts'),
    collections: get('collections'),
    trackAILoadouts: get('trackAILoadouts'),
    series: get('series'),
    trackData: get('trackData'),
  };
}

function getTypeTag(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function inferFieldTypes(items: Record<string, unknown>[]): FieldTypeMap {
  if (items.length === 0) return {};
  const typeSets: Record<string, Set<string>> = {};
  const presenceCount: Record<string, number> = {};

  for (const item of items) {
    for (const [key, value] of Object.entries(item)) {
      if (!typeSets[key]) typeSets[key] = new Set();
      presenceCount[key] = (presenceCount[key] ?? 0) + 1;
      typeSets[key].add(getTypeTag(value));
    }
  }

  const result: FieldTypeMap = {};
  for (const [field, types] of Object.entries(typeSets)) {
    const isOptional = presenceCount[field] < items.length;
    const typeStr = Array.from(types).sort().join('|');
    result[field] = isOptional ? `${typeStr} (optional)` : typeStr;
  }
  return result;
}

function diffStructure(
  baselineItems: Record<string, unknown>[],
  newItems: Record<string, unknown>[]
): StructuralDiff {
  const baseTypes = inferFieldTypes(baselineItems);
  const newTypes = inferFieldTypes(newItems);

  const baseKeys = Object.keys(baseTypes);
  const newKeySet = new Set(Object.keys(newTypes));
  const baseKeySet = new Set(baseKeys);

  const addedFields = Object.keys(newTypes).filter((k) => !baseKeySet.has(k));
  const removedFields = baseKeys.filter((k) => !newKeySet.has(k));
  const typeChanges: { field: string; before: string; after: string }[] = [];

  for (const key of baseKeys) {
    if (newKeySet.has(key) && baseTypes[key] !== newTypes[key]) {
      typeChanges.push({ field: key, before: baseTypes[key], after: newTypes[key] });
    }
  }

  return {
    addedFields,
    removedFields,
    typeChanges,
    hasChanges: addedFields.length > 0 || removedFields.length > 0 || typeChanges.length > 0,
  };
}

const EXCLUDED_FIELDS = new Set(['created_at', 'updated_at']);

function detectFieldDiffs(baseline: Record<string, unknown>, newItem: Record<string, unknown>): FieldDiff[] {
  const allKeysSet = new Set([...Object.keys(baseline), ...Object.keys(newItem)]);
  const allKeys = Array.from(allKeysSet);
  const diffs: FieldDiff[] = [];

  for (const key of allKeys) {
    if (EXCLUDED_FIELDS.has(key)) continue;
    const bVal = baseline[key];
    const nVal = newItem[key];
    const bStr = typeof bVal === 'object' ? JSON.stringify(bVal) : String(bVal ?? '');
    const nStr = typeof nVal === 'object' ? JSON.stringify(nVal) : String(nVal ?? '');
    if (bStr !== nStr) {
      diffs.push({ field: key, before: bVal, after: nVal });
    }
  }
  return diffs;
}

function diffEntityData(
  baselineItems: Record<string, unknown>[],
  newItems: Record<string, unknown>[],
  matchKey = 'id'
): EntityDataDiff {
  const baselineMap = new Map<unknown, Record<string, unknown>>();
  for (const item of baselineItems) {
    baselineMap.set(item[matchKey], item);
  }

  const added: Record<string, unknown>[] = [];
  const modified: ModifiedItem[] = [];
  let unchanged = 0;
  const seenKeys = new Set<unknown>();

  for (const item of newItems) {
    const key = item[matchKey];
    seenKeys.add(key);
    const baseline = baselineMap.get(key);
    if (!baseline) {
      added.push(item);
    } else {
      const fieldDiffs = detectFieldDiffs(baseline, item);
      if (fieldDiffs.length > 0) {
        modified.push({
          id: String(key ?? ''),
          name: (item.name as string | undefined) ?? (item.driverName as string | undefined),
          fieldDiffs,
        });
      } else {
        unchanged++;
      }
    }
  }

  const removed = baselineItems.filter((item) => !seenKeys.has(item[matchKey]));

  return { added, removed, modified, unchanged };
}

function runDiff(
  baseline: Record<EntityType, Record<string, unknown>[]>,
  newCache: Record<EntityType, Record<string, unknown>[]>
): DiffReport {
  const matchKeys: Partial<Record<EntityType, string>> = {
    trackAILoadouts: 'name',
    series: 'index',
  };

  const structural = {} as Record<EntityType, StructuralDiff>;
  const data = {} as Record<EntityType, EntityDataDiff>;
  let hasAnyStructuralChanges = false;

  for (const entity of ENTITY_TYPES) {
    structural[entity] = diffStructure(baseline[entity], newCache[entity]);
    if (structural[entity].hasChanges) hasAnyStructuralChanges = true;
    data[entity] = diffEntityData(baseline[entity], newCache[entity], matchKeys[entity] ?? 'id');
  }

  return { structural, data, hasAnyStructuralChanges };
}

// ---------------------------------------------------------------------------
// UI helpers
// ---------------------------------------------------------------------------

const ENTITY_LABELS: Record<EntityType, string> = {
  drivers: 'Drivers',
  carparts: 'Car Parts',
  boosts: 'Boosts',
  collections: 'Collections',
  trackAILoadouts: 'AI Track Loadouts',
  series: 'Series',
  trackData: 'Track Data',
};

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') {
    const str = JSON.stringify(value);
    return str.length > 120 ? str.slice(0, 117) + '...' : str;
  }
  return String(value);
}

function Chip({
  children,
  color,
}: {
  children: React.ReactNode;
  color: 'green' | 'red' | 'orange' | 'gray';
}) {
  const cls = {
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    orange: 'bg-orange-100 text-orange-800',
    gray: 'bg-gray-100 text-gray-700',
  }[color];
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono mr-1 mb-1 ${cls}`}>
      {children}
    </span>
  );
}

function StructuralSection({ structural }: { structural: Record<EntityType, StructuralDiff>; hasAny: boolean }) {
  const changedEntities = ENTITY_TYPES.filter((e) => structural[e].hasChanges);

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        Structural Analysis
      </h2>

      {changedEntities.length === 0 ? (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm font-medium">
          No structural changes detected — field names and types are identical between the two files.
        </div>
      ) : (
        <>
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg mb-4 text-amber-800 text-sm font-medium">
            Structural changes detected in {changedEntities.length} entity type{changedEntities.length !== 1 ? 's' : ''}.
            Review carefully before importing.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {changedEntities.map((entity) => {
              const diff = structural[entity];
              return (
                <Card key={entity} className="p-4 border-amber-200">
                  <h3 className="font-semibold text-gray-900 mb-2">{ENTITY_LABELS[entity]}</h3>
                  {diff.addedFields.length > 0 && (
                    <div className="mb-2">
                      <span className="text-xs font-medium text-green-700 uppercase tracking-wide">Added fields</span>
                      <div className="mt-1">
                        {diff.addedFields.map((f) => (
                          <Chip key={f} color="green">+ {f}</Chip>
                        ))}
                      </div>
                    </div>
                  )}
                  {diff.removedFields.length > 0 && (
                    <div className="mb-2">
                      <span className="text-xs font-medium text-red-700 uppercase tracking-wide">Removed fields</span>
                      <div className="mt-1">
                        {diff.removedFields.map((f) => (
                          <Chip key={f} color="red">- {f}</Chip>
                        ))}
                      </div>
                    </div>
                  )}
                  {diff.typeChanges.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-orange-700 uppercase tracking-wide">Type changes</span>
                      <div className="mt-1 space-y-1">
                        {diff.typeChanges.map((tc) => (
                          <div key={tc.field} className="text-xs font-mono">
                            <Chip color="orange">{tc.field}</Chip>
                            <span className="text-red-600">{tc.before}</span>
                            {' → '}
                            <span className="text-green-600">{tc.after}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function DataSection({ data }: { data: Record<EntityType, EntityDataDiff> }) {
  const totalAdded = ENTITY_TYPES.reduce((s, e) => s + data[e].added.length, 0);
  const totalRemoved = ENTITY_TYPES.reduce((s, e) => s + data[e].removed.length, 0);
  const totalModified = ENTITY_TYPES.reduce((s, e) => s + data[e].modified.length, 0);

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Data Changes</h2>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-4 text-center bg-green-50">
          <div className="text-2xl font-bold text-green-700">{totalAdded}</div>
          <div className="text-sm text-green-600">New items</div>
        </Card>
        <Card className="p-4 text-center bg-red-50">
          <div className="text-2xl font-bold text-red-700">{totalRemoved}</div>
          <div className="text-sm text-red-600">Removed items</div>
        </Card>
        <Card className="p-4 text-center bg-blue-50">
          <div className="text-2xl font-bold text-blue-700">{totalModified}</div>
          <div className="text-sm text-blue-600">Modified items</div>
        </Card>
      </div>

      {/* Per-entity details */}
      <div className="space-y-3">
        {ENTITY_TYPES.map((entity) => {
          const d = data[entity];
          const hasAny = d.added.length > 0 || d.removed.length > 0 || d.modified.length > 0;
          return (
            <details key={entity} open={hasAny} className="group">
              <summary className="flex items-center justify-between cursor-pointer list-none p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100">
                <span className="font-medium text-gray-900">{ENTITY_LABELS[entity]}</span>
                <span className="text-sm text-gray-500 flex gap-3">
                  {d.added.length > 0 && <span className="text-green-600">+{d.added.length}</span>}
                  {d.removed.length > 0 && <span className="text-red-600">-{d.removed.length}</span>}
                  {d.modified.length > 0 && <span className="text-blue-600">{d.modified.length} modified</span>}
                  <span className="text-gray-400">{d.unchanged} unchanged</span>
                </span>
              </summary>

              <div className="mt-2 pl-4 space-y-3">
                {d.added.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-green-700 uppercase tracking-wide mb-1">
                      Added ({d.added.length})
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {d.added.map((item, i) => (
                        <Chip key={i} color="green">
                          {(item.name as string | undefined) ?? String(item.id ?? i)}
                        </Chip>
                      ))}
                    </div>
                  </div>
                )}

                {d.removed.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-red-700 uppercase tracking-wide mb-1">
                      Removed ({d.removed.length})
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {d.removed.map((item, i) => (
                        <Chip key={i} color="red">
                          {(item.name as string | undefined) ?? String(item.id ?? i)}
                        </Chip>
                      ))}
                    </div>
                  </div>
                )}

                {d.modified.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-1">
                      Modified ({d.modified.length})
                    </div>
                    <div className="space-y-2">
                      {d.modified.map((item) => (
                        <details key={item.id} className="border border-gray-200 rounded">
                          <summary className="cursor-pointer list-none px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50">
                            {item.name ? `${item.name} (${item.id})` : item.id}
                            <span className="ml-2 text-xs text-gray-400">
                              {item.fieldDiffs.length} field{item.fieldDiffs.length !== 1 ? 's' : ''} changed
                            </span>
                          </summary>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="bg-gray-50 border-t border-gray-200">
                                  <th className="text-left px-3 py-2 font-medium text-gray-600 w-1/4">Field</th>
                                  <th className="text-left px-3 py-2 font-medium text-red-600 w-[37.5%]">Before</th>
                                  <th className="text-left px-3 py-2 font-medium text-green-600 w-[37.5%]">After</th>
                                </tr>
                              </thead>
                              <tbody>
                                {item.fieldDiffs.map((fd) => (
                                  <tr key={fd.field} className="border-t border-gray-100">
                                    <td className="px-3 py-2 font-mono text-gray-700">{fd.field}</td>
                                    <td className="px-3 py-2 font-mono text-red-700 bg-red-50 break-all">
                                      {formatValue(fd.before)}
                                    </td>
                                    <td className="px-3 py-2 font-mono text-green-700 bg-green-50 break-all">
                                      {formatValue(fd.after)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                )}

                {d.added.length === 0 && d.removed.length === 0 && d.modified.length === 0 && (
                  <p className="text-sm text-gray-500">No data changes.</p>
                )}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}

function FileDropzone({
  label,
  file,
  inputId,
  inputRef,
  onChange,
}: {
  label: string;
  file: File | null;
  inputId: string;
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
  onChange: (file: File) => void;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onChange(f);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <input
          ref={inputRef}
          type="file"
          accept=".json"
          onChange={handleChange}
          className="hidden"
          id={inputId}
        />
        <label htmlFor={inputId} className="cursor-pointer text-gray-600 hover:text-gray-900">
          {file ? (
            <div className="flex items-center justify-center space-x-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-blue-700">{file.name}</span>
            </div>
          ) : (
            <div className="space-y-1">
              <Upload className="w-6 h-6 mx-auto text-gray-400" />
              <p className="text-sm">Click to select JSON file</p>
            </div>
          )}
        </label>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ContentCacheDiffPage() {
  const { user } = useAuth();

  const [baselineFile, setBaselineFile] = useState<File | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<DiffReport | null>(null);

  const baselineInputRef = useRef<HTMLInputElement>(null);
  const newInputRef = useRef<HTMLInputElement>(null);

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await fetch(`/api/profiles/${user.id}`, {
        headers: await getAuthHeaders(),
        credentials: 'same-origin',
      });
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const isAdmin = profile?.is_admin || false;

  if (isProfileLoading && user?.id) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center py-16">
          <Card className="p-8 max-w-md mx-auto text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking permissions...</p>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  if (!isAdmin) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center py-16">
          <Card className="p-8 max-w-md mx-auto text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6">You need admin privileges to access this page.</p>
            <Link href="/admin">
              <Button>Back to Admin</Button>
            </Link>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  const handleRunDiff = async () => {
    if (!baselineFile || !newFile) return;

    setIsProcessing(true);
    setError(null);
    setReport(null);

    try {
      const [baselineText, newText] = await Promise.all([baselineFile.text(), newFile.text()]);
      const baselineRaw = JSON.parse(baselineText);
      const newRaw = JSON.parse(newText);

      const baseline = parseContentCache(baselineRaw);
      const newCache = parseContentCache(newRaw);

      const result = runDiff(baseline, newCache);
      setReport(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse or compare files');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto py-1 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <GitCompareArrows className="w-8 h-8 text-yellow-600" />
                Content Cache Diff
              </h1>
              <p className="mt-2 text-gray-600">
                Compare two content_cache.json files to detect structural and data changes
              </p>
            </div>
            <Link href="/admin/content-cache">
              <Button variant="outline">Back to Content Cache</Button>
            </Link>
          </div>
        </div>

        {/* File upload panel */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <FileDropzone
              label="Baseline (Old Version)"
              file={baselineFile}
              inputId="baseline-upload"
              inputRef={baselineInputRef}
              onChange={setBaselineFile}
            />
            <FileDropzone
              label="New Version"
              file={newFile}
              inputId="new-upload"
              inputRef={newInputRef}
              onChange={setNewFile}
            />
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleRunDiff}
              disabled={!baselineFile || !newFile || isProcessing}
            >
              {isProcessing ? 'Comparing...' : 'Run Diff'}
            </Button>
            {(baselineFile || newFile) && (
              <Button
                variant="outline"
                onClick={() => {
                  setBaselineFile(null);
                  setNewFile(null);
                  setReport(null);
                  setError(null);
                  if (baselineInputRef.current) baselineInputRef.current.value = '';
                  if (newInputRef.current) newInputRef.current.value = '';
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </Card>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Results */}
        {report && (
          <div>
            <StructuralSection structural={report.structural} hasAny={report.hasAnyStructuralChanges} />
            <DataSection data={report.data} />
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
