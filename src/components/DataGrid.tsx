import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { UserAssetView, CatalogItem, Boost } from '@/types/database';
import { cn, formatNumber } from '@/lib/utils';

interface DataGridProps {
  assets?: UserAssetView[];
  items?: CatalogItem[];
  boosts?: Boost[];
  onAddToCollection?: (item: CatalogItem) => void;
  onRemoveFromCollection?: (item: CatalogItem) => void;
  onCompare?: (items: CatalogItem[]) => void;
  onCompareSingle?: (item: CatalogItem) => void;
  compareItems?: CatalogItem[];
  className?: string;
  title?: string;
  showFilters?: boolean;
  showSearch?: boolean;
  showCompareButton?: boolean;
  gridType?: 'drivers' | 'parts' | 'boosts';
}

interface FilterState {
  search: string;
  rarity: number | null;
  cardType: number | null;
  owned: boolean | null;
  sortBy: 'name' | 'rarity' | 'series' | 'level' | 'cc_price';
  sortOrder: 'asc' | 'desc';
}

// Extended types for unified filtering
interface AssetItem extends UserAssetView {
  is_asset: true;
}

interface CatalogItemItem extends CatalogItem {
  is_asset: false;
}

interface BoostItem extends Boost {
  is_boost: true;
}

type FilterableItem = AssetItem | CatalogItemItem | BoostItem;

export function DataGrid({
  assets = [],
  items = [],
  boosts = [],
  onAddToCollection,
  onRemoveFromCollection,
  onCompare,
  compareItems = [],
  className,
  title = 'Assets',
  showFilters = true,
  showSearch = true,
  showCompareButton = true,
  gridType = 'drivers',
}: DataGridProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    rarity: null,
    cardType: null,
    owned: null,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  // Combine assets and items for unified display
  const allItems: FilterableItem[] = assets.length > 0
    ? assets.map(asset => ({ ...asset, is_asset: true } as FilterableItem))
    : boosts.length > 0
      ? boosts.map(boost => ({ ...boost, is_boost: true } as FilterableItem))
      : items.map(item => ({ ...item, is_asset: false } as FilterableItem));

  // Filter and search logic
  const filteredItems = allItems.filter((item: FilterableItem) => {
    const matchesSearch = !filters.search ||
      item.name.toLowerCase().includes(filters.search.toLowerCase());

    const matchesRarity = filters.rarity === null || item.rarity === filters.rarity;

            // Only filter by card type if not boosts
            const matchesCardType = filters.cardType === null ||
              (gridType === 'boosts' ? true : (item as CatalogItemItem | AssetItem).card_type === filters.cardType);

    // Handle ownership filtering - only apply if we have assets (user data)
    const matchesOwned = filters.owned === null ||
      (assets.length === 0) || // If no assets, don't filter by ownership
      (filters.owned ? (item as AssetItem).is_owned : !(item as AssetItem).is_owned);

    return matchesSearch && matchesRarity && matchesCardType && matchesOwned;
  });

  // Sorting logic
  const sortedItems = [...filteredItems].sort((a, b) => {
    let comparison = 0;

    switch (filters.sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'rarity':
        comparison = a.rarity - b.rarity;
        break;
      case 'series':
        comparison = (a.series || 0) - (b.series || 0);
        break;
      case 'cc_price':
        // Only sort by cc_price if not boosts
        if (gridType === 'boosts') {
          comparison = 0;
        } else {
          comparison = ((a as CatalogItemItem | AssetItem).cc_price || 0) - ((b as CatalogItemItem | AssetItem).cc_price || 0);
        }
        break;
      case 'level':
        // Only sort by level if we have assets data
        if ('is_asset' in a && 'is_asset' in b && a.is_asset && b.is_asset) {
          comparison = (a as UserAssetView).level - (b as UserAssetView).level;
        } else {
          comparison = 0;
        }
        break;
      default:
        comparison = 0;
    }

    return filters.sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleCompare = (item: CatalogItem) => {
    if (onCompare) {
      const isAlreadyCompared = compareItems.some(compared => compared.id === item.id);
      if (isAlreadyCompared) {
        onCompare(compareItems.filter(compared => compared.id !== item.id));
      } else if (compareItems.length < 4) {
        onCompare([...compareItems, item]);
      }
    }
  };

  const isInComparison = (item: CatalogItem) => {
    return compareItems.some(compared => compared.id === item.id);
  };

  // Helper function to get rarity display name
  const getRarityDisplay = (rarity: number): string => {
    const rarityMap: Record<number, string> = {
      0: 'Common',
      1: 'Uncommon',
      2: 'Rare',
      3: 'Epic',
      4: 'Legendary'
    };
    return rarityMap[rarity] || 'Unknown';
  };

  // Helper function to get card type display name
  const getCardTypeDisplay = (cardType: number): string => {
    const typeMap: Record<number, string> = {
      0: 'Car Part',
      1: 'Driver'
    };
    return typeMap[cardType] || 'Unknown';
  };

  // Helper function to get car part type display name
  const getCarPartTypeDisplay = (carPartType: number | null): string => {
    if (carPartType === null) return 'N/A';
    const typeMap: Record<number, string> = {
      0: 'Engine',
      1: 'Transmission',
      2: 'Suspension',
      3: 'Aerodynamics'
    };
    return typeMap[carPartType] || 'Unknown';
  };

  // Get rarity badge variant
  const getRarityBadgeVariant = (rarity: number) => {
    return rarity === 4 ? 'destructive' :
           rarity === 3 ? 'secondary' :
           rarity === 2 ? 'default' : 'outline';
  };

  // Get columns based on grid type
  const getColumns = () => {
    const baseColumns = [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'rarity', label: 'Rarity', sortable: true },
      { key: 'series', label: 'Series', sortable: true },
    ];

    if (gridType === 'drivers' || gridType === 'parts') {
      baseColumns.push({ key: 'cc_price', label: 'Price (CC)', sortable: true });
    }

    if (gridType === 'parts') {
      baseColumns.push({ key: 'car_part_type', label: 'Part Type', sortable: false });
    }

    if (gridType === 'boosts') {
      baseColumns.push({ key: 'boost_type', label: 'Boost Type', sortable: false });
    }

    // Add level and cards columns if we have asset data
    if (assets.length > 0) {
      baseColumns.push(
        { key: 'level', label: 'Level', sortable: true },
        { key: 'card_count', label: 'Cards', sortable: false }
      );
    }

    baseColumns.push({ key: 'actions', label: 'Actions', sortable: false });

    return baseColumns;
  };

  const columns = getColumns();

  return (
    <div className={cn('w-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <Badge variant="outline">
            {sortedItems.length} item{sortedItems.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        {showCompareButton && compareItems.length > 0 && (
          <Button
            variant="primary"
            onClick={() => onCompare?.(compareItems)}
            className="relative"
          >
            Compare ({compareItems.length})
            {compareItems.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 p-1 h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onCompare?.([]);
                }}
              >
                ×
              </Button>
            )}
          </Button>
        )}
      </div>

      {/* Filters and Search */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {showSearch && (
              <div className="lg:col-span-2">
                <Input
                  placeholder="Search assets..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
            )}

            <div>
              <select
                className="w-full rounded-lg border-gray-300 text-sm"
                value={filters.rarity ?? ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  rarity: e.target.value ? Number(e.target.value) : null
                }))}
              >
                <option value="">All Rarities</option>
                <option value="4">Legendary</option>
                <option value="3">Epic</option>
                <option value="2">Rare</option>
                <option value="1">Uncommon</option>
                <option value="0">Common</option>
              </select>
            </div>

            {gridType !== 'boosts' && (
              <div>
                <select
                  className="w-full rounded-lg border-gray-300 text-sm"
                  value={filters.cardType ?? ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    cardType: e.target.value ? Number(e.target.value) : null
                  }))}
                >
                  <option value="">All Types</option>
                  <option value="0">Car Parts</option>
                  <option value="1">Drivers</option>
                </select>
              </div>
            )}

            {/* Only show ownership filter if we have assets data */}
            {assets.length > 0 && (
              <div>
                <select
                  className="w-full rounded-lg border-gray-300 text-sm"
                  value={filters.owned === null ? '' : filters.owned.toString()}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    owned: e.target.value === '' ? null : e.target.value === 'true'
                  }))}
                >
                  <option value="">All Items</option>
                  <option value="true">Owned</option>
                  <option value="false">Not Owned</option>
                </select>
              </div>
            )}

            <div className="flex space-x-2">
              <select
                className="flex-1 rounded-lg border-gray-300 text-sm"
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  sortBy: e.target.value as FilterState['sortBy']
                }))}
              >
                <option value="name">Name</option>
                <option value="rarity">Rarity</option>
                <option value="series">Series</option>
                {assets.length > 0 && <option value="level">Level</option>}
                {gridType !== 'boosts' && <option value="cc_price">Price</option>}
              </select>

              <Button
                variant="outline"
                size="sm"
                className="px-3"
                onClick={() => setFilters(prev => ({
                  ...prev,
                  sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
                }))}
              >
                {filters.sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Data Grid Table */}
      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  )}
                  onClick={() => {
                    if (column.sortable && column.key !== 'actions') {
                      setFilters(prev => ({
                        ...prev,
                        sortBy: column.key as FilterState['sortBy'],
                        sortOrder: prev.sortBy === column.key
                          ? prev.sortOrder === 'asc' ? 'desc' : 'asc'
                          : 'asc'
                      }));
                    }
                  }}
                >
                  <div className="flex items-center">
                    {column.label}
                    {column.sortable && filters.sortBy === column.key && (
                      <span className="ml-1">
                        {filters.sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedItems.map((item) => {
              const isAsset = 'is_asset' in item && item.is_asset;
              const isBoost = 'is_boost' in item && item.is_boost;
              const catalogItem = isAsset ? item as UserAssetView : isBoost ? item as Boost : item as CatalogItem;
              const isOwned = isAsset ? (item as UserAssetView).is_owned : false;

              return (
                <tr
                  key={catalogItem.id}
                  className={cn(
                    'hover:bg-gray-50 transition-colors',
                    isInComparison(catalogItem as CatalogItem) && 'bg-blue-50'
                  )}
                >
                  {/* Name Column */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">{catalogItem.name}</div>
                    </div>
                    {gridType !== 'boosts' && (
                  <div className="text-xs text-gray-500">
                    {gridType !== 'boosts' && !(catalogItem as BoostItem).is_boost ? getCardTypeDisplay((catalogItem as CatalogItemItem | AssetItem).card_type) + ' • ' : ''}Series {catalogItem.series}
                  </div>
                    )}
                  </td>

                  {/* Rarity Column */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getRarityBadgeVariant(catalogItem.rarity)}>
                      {getRarityDisplay(catalogItem.rarity)}
                    </Badge>
                  </td>

                  {/* Series Column */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{catalogItem.series}</div>
                  </td>

                  {/* Price Column (for drivers/parts) */}
                  {gridType !== 'boosts' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {(catalogItem as CatalogItemItem | AssetItem).cc_price ? formatNumber((catalogItem as CatalogItemItem | AssetItem).cc_price) + ' CC' : 'N/A'}
                      </div>
                    </td>
                  )}

                  {/* Part Type Column (for parts) */}
                  {gridType === 'parts' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getCarPartTypeDisplay((catalogItem as CatalogItemItem | AssetItem).car_part_type)}
                      </div>
                    </td>
                  )}

                  {/* Boost Type Column (for boosts) */}
                  {gridType === 'boosts' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {(catalogItem as BoostItem).boost_type}
                      </div>
                    </td>
                  )}

                  {/* Level Column (if asset data available) */}
                  {assets.length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {isAsset ? (item as UserAssetView).level : 'N/A'}
                      </div>
                    </td>
                  )}

                  {/* Cards Column (if asset data available) */}
                  {assets.length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {isAsset ? (item as UserAssetView).card_count : 'N/A'}
                      </div>
                    </td>
                  )}

                  {/* Actions Column */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {onCompare && (
                        <Button
                          variant={isInComparison(catalogItem as CatalogItem) ? 'primary' : 'outline'}
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompare(catalogItem as CatalogItem);
                          }}
                        >
                          {isInComparison(catalogItem as CatalogItem) ? 'Remove' : 'Compare'}
                        </Button>
                      )}

                      {isOwned && onRemoveFromCollection ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveFromCollection(catalogItem as CatalogItem);
                          }}
                        >
                          Remove
                        </Button>
                      ) : !isOwned && onAddToCollection ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCollection(catalogItem as CatalogItem);
                          }}
                        >
                          Add
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Empty State */}
        {sortedItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">No items found</div>
            <div className="text-gray-400 text-sm">
              Try adjusting your search or filter criteria
            </div>
          </div>
        )}
      </div>
    </div>
  );
}