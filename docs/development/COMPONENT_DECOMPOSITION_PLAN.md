# Component Decomposition Plan

This document outlines the strategy for decomposing large React components into smaller, more maintainable pieces.

## Files Analyzed

| File | Lines | Primary Concerns |
|------|-------|------------------|
| `src/app/data-input/page.tsx` | ~700 | Three similar tabs with duplicated patterns |
| `src/components/DataGrid.tsx` | ~700 | Multiple responsibilities in single component |

---

## 1. Data Input Page Decomposition

### Current Structure
```
data-input/page.tsx
├── Constants (LEVEL_RANGES)
├── Custom Hooks (useUpdateDriverData, useUpdateCarPartData, useUpdateBoostData)
├── DriversTab component
├── PartsTab component
├── BoostsTab component
└── DataInputPage component
```

### Proposed Structure
```
src/app/data-input/
├── page.tsx                    # Main page component (~50 lines)
├── components/
│   ├── DataInputTabs.tsx       # Tab navigation component
│   ├── DriversTab.tsx          # Drivers data entry
│   ├── PartsTab.tsx            # Car parts data entry
│   └── BoostsTab.tsx           # Boosts data entry
├── hooks/
│   ├── useUpdateDriverData.ts  # Driver mutation hook
│   ├── useUpdateCarPartData.ts # Car part mutation hook
│   └── useUpdateBoostData.ts   # Boost mutation hook
├── utils/
│   ├── sorting.ts              # Sorting logic for each asset type
│   └── constants.ts            # LEVEL_RANGES and other constants
└── types.ts                    # TypeScript interfaces
```

### Components to Extract

#### 1.1 Custom Mutation Hooks
**Current Location**: Lines 36-94 in `page.tsx`

**Extract to**: `src/app/data-input/hooks/useUpdateDriverData.ts`
```typescript
// useUpdateDriverData.ts
export const useUpdateDriverData = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ driverId, data }) => { ... },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['user-drivers'] }); },
  });
};
```

**Benefits**:
- Reusable across components
- Easier to test in isolation
- Separates data fetching from UI

#### 1.2 Sorting Utilities
**Current Location**: Lines 111-145 (DriversTab), Lines 310-340 (PartsTab)

**Extract to**: `src/app/data-input/utils/sorting.ts`
```typescript
// sorting.ts
export const sortDrivers = (drivers: DriverView[]): DriverView[] => { ... };
export const sortCarParts = (parts: CarPartView[]): CarPartView[] => { ... };
export const sortBoosts = (boosts: BoostWithCustomName[]): BoostWithCustomName[] => { ... };
```

#### 1.3 Tab Components
**Current Location**: Lines 108-280 (DriversTab), Lines 282-460 (PartsTab), Lines 462-560 (BoostsTab)

**Extract to**: Separate files in `src/app/data-input/components/`

Each tab component will:
- Receive data via props
- Use shared mutation hooks
- Use shared sorting utilities
- Be testable in isolation

### Data Input File Size Targets
| File | Current Lines | Target Lines |
|------|---------------|--------------|
| `page.tsx` | ~700 | ~50 |
| `DriversTab.tsx` | (embedded) | ~120 |
| `PartsTab.tsx` | (embedded) | ~120 |
| `BoostsTab.tsx` | (embedded) | ~80 |
| `sorting.ts` | (embedded) | ~60 |
| Each hook file | (embedded) | ~20 |

---

## 2. DataGrid Component Decomposition

### Current Structure
```
DataGrid.tsx
├── FreeBoostCheckbox component
├── Helper functions (getStatBackgroundColor, localStorage utilities)
├── Type definitions (FilterState, FilterableItem, etc.)
├── DataGrid main component
│   ├── Filter state management
│   ├── Sort preferences persistence
│   ├── Filtering logic
│   ├── Sorting logic (complex with multiple cases)
│   ├── Column definitions
│   ├── Column statistics calculation
│   └── Row rendering (multiple grid types)
```

### Proposed Structure
```
src/components/DataGrid/
├── index.ts                    # Exports DataGrid component
├── DataGrid.tsx                # Main component (~150 lines)
├── components/
│   ├── DataGridHeader.tsx      # Table header with sorting
│   ├── DataGridRow.tsx         # Single row renderer
│   ├── DataGridFilters.tsx     # Filter controls
│   ├── FreeBoostCheckbox.tsx   # Admin boost control
│   └── EmptyState.tsx          # Empty data display
├── hooks/
│   ├── useGridFilters.ts       # Filter state management
│   ├── useGridSort.ts          # Sort state + localStorage
│   └── useColumnStats.ts       # Column statistics calculation
├── utils/
│   ├── sorting.ts              # Sorting functions for each type
│   ├── filtering.ts            # Filter functions
│   ├── colors.ts               # Color calculation utilities
│   └── columns.ts              # Column definition generators
└── types.ts                    # TypeScript interfaces
```

### Components to Extract

#### 2.1 FreeBoostCheckbox
**Current Location**: Lines 22-78

**Extract to**: `src/components/DataGrid/components/FreeBoostCheckbox.tsx`
- Already a self-contained component
- No changes needed, just relocate

#### 2.2 Color Utilities
**Current Location**: Lines 80-105

**Extract to**: `src/components/DataGrid/utils/colors.ts`
```typescript
// colors.ts
export const getStatBackgroundColor = (value: number, min: number, max: number, median: number): string => { ... };
export const getBoostValueColor = (tierValue: number): string => { ... };
```

#### 2.3 Sort Preference Utilities
**Current Location**: Lines 107-155

**Extract to**: `src/components/DataGrid/utils/sorting.ts`
```typescript
// sorting.ts
export const SORT_PREFERENCES_KEY = 'f1-sort-preferences';
export const getDefaultSortForGridType = (gridType: string) => { ... };
export const loadSortPreferences = (gridType: string) => { ... };
export const saveSortPreferences = (gridType: string, sortBy: string, sortOrder: 'asc' | 'desc') => { ... };
```

#### 2.4 useGridSort Hook
**Current Location**: Lines 300-420 (sorting logic)

**Extract to**: `src/components/DataGrid/hooks/useGridSort.ts`
```typescript
// useGridSort.ts
export const useGridSort = (gridType: string, items: FilterableItem[], filters: FilterState) => {
  // Sorting preferences persistence
  // Sorting logic
  // Return sortedItems
};
```

#### 2.5 useColumnStats Hook
**Current Location**: Lines 540-650 (column statistics)

**Extract to**: `src/components/DataGrid/hooks/useColumnStats.ts`
```typescript
// useColumnStats.ts
export const useColumnStats = (gridType: string, items: FilterableItem[], bonusSettings: BonusSettings) => {
  // Calculate min/max/median for each stat column
  // Return stats object
};
```

#### 2.6 Column Definition Generator
**Current Location**: Lines 450-540 (getColumns function)

**Extract to**: `src/components/DataGrid/utils/columns.ts`
```typescript
// columns.ts
export const getDriverColumns = (): ColumnDef[] => { ... };
export const getPartsColumns = (): ColumnDef[] => { ... };
export const getBoostsColumns = (): ColumnDef[] => { ... };
```

#### 2.7 DataGridRow Component
**Current Location**: Lines 700-950 (row rendering logic)

**Extract to**: `src/components/DataGrid/components/DataGridRow.tsx`
```typescript
// DataGridRow.tsx
interface DataGridRowProps {
  item: FilterableItem;
  gridType: 'drivers' | 'parts' | 'boosts';
  columnStats: ColumnStats;
  // ... other props
}

export const DataGridRow: React.FC<DataGridRowProps> = ({ item, gridType, ... }) => {
  // Row rendering logic
};
```

### DataGrid File Size Targets
| File | Current Lines | Target Lines |
|------|---------------|--------------|
| `DataGrid.tsx` | ~700 | ~150 |
| `DataGridRow.tsx` | (embedded) | ~150 |
| `sorting.ts` | (embedded) | ~100 |
| `columns.ts` | (embedded) | ~80 |
| `colors.ts` | (embedded) | ~40 |
| Each hook file | (embedded) | ~50-80 |

---

## 3. Implementation Priority

### Phase 1: Data Input Page (Lower Risk)
1. Extract constants to `utils/constants.ts`
2. Extract mutation hooks to `hooks/` directory
3. Extract sorting utilities to `utils/sorting.ts`
4. Extract DriversTab component
5. Extract PartsTab component
6. Extract BoostsTab component
7. Refactor main page to use extracted components

**Estimated Time**: 2-3 hours
**Risk Level**: Low (isolated changes, no shared components affected)

### Phase 2: DataGrid Component (Higher Risk)
1. Extract FreeBoostCheckbox component
2. Extract color utilities to `utils/colors.ts`
3. Extract sorting utilities to `utils/sorting.ts`
4. Create `useGridSort` hook
5. Create `useColumnStats` hook
6. Extract column definitions to `utils/columns.ts`
7. Create DataGridRow component
8. Create DataGridFilters component
9. Refactor main DataGrid to use extracted pieces

**Estimated Time**: 4-6 hours
**Risk Level**: Medium (used across multiple pages, needs thorough testing)

---

## 4. Testing Strategy

### For Data Input Page
- Test each mutation hook independently
- Test sorting functions with various input data
- Test each tab component with mock data
- Integration test for the full page

### For DataGrid
- Test sorting utilities with all grid types
- Test filter functions
- Test color calculation functions
- Test column stats calculation
- Test row rendering for each grid type
- Visual regression testing for each grid type

---

## 5. Benefits of Decomposition

### Maintainability
- Smaller files are easier to understand
- Clear separation of concerns
- Easier to locate specific functionality

### Testability
- Individual functions can be unit tested
- Components can be tested in isolation
- Mock data easier to manage

### Reusability
- Hooks can be reused across components
- Utility functions can be shared
- Components can be composed differently

### Performance
- Easier to identify performance bottlenecks
- Can memoize at smaller granularity
- Potential for code splitting

### Developer Experience
- Faster IDE navigation
- Better IntelliSense
- Easier code reviews

---

## 6. Potential Risks and Mitigations

### Risk: Breaking existing functionality
**Mitigation**: 
- Create comprehensive test suite before refactoring
- Refactor one piece at a time
- Keep original code commented until verified

### Risk: Prop drilling in decomposed components
**Mitigation**: 
- Use context for shared state where appropriate
- Create custom hooks for complex state logic
- Keep prop interfaces minimal and well-typed

### Risk: Over-abstraction
**Mitigation**: 
- Only extract code that has clear boundaries
- Avoid creating too many small files
- Keep related functionality together

---

## 7. Timeline

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Planning | Document review & approval | 1 hour |
| Phase 1 | Data Input decomposition | 2-3 hours |
| Testing | Data Input tests | 1 hour |
| Phase 2 | DataGrid decomposition | 4-6 hours |
| Testing | DataGrid tests | 2 hours |
| Review | Code review & adjustments | 2 hours |

**Total Estimated Time**: 12-15 hours

---

## 8. Success Criteria

- [ ] Data Input page main file under 100 lines
- [ ] DataGrid main file under 200 lines
- [ ] All extracted components have TypeScript types
- [ ] No functionality regression (all existing features work)
- [ ] All tests passing
- [ ] Code review approved
- [ ] Documentation updated

---

**Document Created**: February 20, 2026
**Author**: Code Review Recommendations
**Status**: Planning Complete, Ready for Implementation