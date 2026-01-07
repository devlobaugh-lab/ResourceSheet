import React, { useState } from 'react';
import { AssetCard } from './AssetCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { UserAssetView, CatalogItem } from '@/types/database';
import { cn } from '@/lib/utils';

interface AssetGridProps {
  assets?: UserAssetView[];
  items?: CatalogItem[];
  onAddToCollection?: (item: CatalogItem) => void;
  onRemoveFromCollection?: (item: CatalogItem) => void;
  onCompare?: (items: CatalogItem[]) => void;
  onCompareSingle?: (item: CatalogItem) => void; // For single item toggle
  compareItems?: CatalogItem[];
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
  title?: string;
  showFilters?: boolean;
  showSearch?: boolean;
  showCompareButton?: boolean;
}

interface FilterState {
  search: string;
  rarity: number | null;
  cardType: number | null;
  owned: boolean | null;
  sortBy: 'name' | 'rarity' | 'series' | 'level';
  sortOrder: 'asc' | 'desc';
}

// Extended types for unified filtering
interface AssetItem extends UserAssetView {
  is_asset: true;
}

interface CatalogItemItem extends CatalogItem {
  is_asset: false;
}

type FilterableItem = AssetItem | CatalogItemItem;

export function AssetGrid({
  assets = [],
  items = [],
  onAddToCollection,
  onRemoveFromCollection,
  onCompare,
  compareItems = [],
  className,
  variant = 'default',
  title = 'Assets',
  showFilters = true,
  showSearch = true,
  showCompareButton = true,
}: AssetGridProps) {
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
    : items.map(item => ({ ...item, is_asset: false } as FilterableItem));

  // Filter and search logic
  const filteredItems = allItems.filter((item: FilterableItem) => {
    const matchesSearch = !filters.search || 
      item.name.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesRarity = filters.rarity === null || item.rarity === filters.rarity;
    
    const matchesCardType = filters.cardType === null || item.card_type === filters.cardType;
    
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
        comparison = a.series - b.series;
        break;
      case 'level':
        // Only sort by level if we have assets data
        if (a.is_asset && b.is_asset) {
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

  // Grid layout classes for desktop-first design
  const gridClasses = {
    default: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
    compact: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8',
    detailed: 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4',
  };

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

      {/* Asset Grid */}
      <div className={cn(
        'grid gap-6',
        gridClasses[variant]
      )}>
        {sortedItems.map((item) => (
          <AssetCard
            key={item.id}
            asset={item.is_asset ? item as UserAssetView : undefined}
            item={!item.is_asset ? item as CatalogItem : undefined}
            variant={variant}
            onAddToCollection={onAddToCollection}
            onRemoveFromCollection={onRemoveFromCollection}
            onCompare={onCompare ? handleCompare : undefined}
            isInComparison={isInComparison(item as CatalogItem)}
            showOwnership={assets.length > 0}
          />
        ))}
      </div>

      {/* Empty State */}
      {sortedItems.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No assets found</div>
          <div className="text-gray-400 text-sm">
            Try adjusting your search or filter criteria
          </div>
        </div>
      )}
    </div>
  );
}
