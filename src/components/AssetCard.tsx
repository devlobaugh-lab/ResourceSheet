import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { UserAssetView, CatalogItem, Boost } from '@/types/database';
import { formatNumber } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface AssetCardProps {
  asset?: UserAssetView; // If provided, shows ownership status
  item?: CatalogItem; // If provided, shows catalog item details
  boost?: Boost;
  onAddToCollection?: (item: CatalogItem) => void;
  onRemoveFromCollection?: (item: CatalogItem) => void;
  onCompare?: (item: CatalogItem) => void;
  isInComparison?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
  showOwnership?: boolean;
}

export function AssetCard({
  asset,
  item,
  boost,
  onAddToCollection,
  onRemoveFromCollection,
  onCompare,
  isInComparison = false,
  className,
  variant = 'default',
  showOwnership = true,
}: AssetCardProps) {
  const catalogItem = asset || item;
  const isOwned = asset?.is_owned || false;
  
  if (!catalogItem) return null;

  // Helper function to get rarity display name
  const getRarityDisplay = (rarity: number): string => {
    const rarityMap: Record<number, string> = {
      0: 'Basic',
      1: 'Common', 
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

  const cardVariants = {
    default: 'p-6',
    compact: 'p-4',
    detailed: 'p-8',
  };

  const gridClasses = {
    default: 'grid-cols-1',
    compact: 'grid-cols-1',
    detailed: 'grid-cols-1 md:grid-cols-2',
  };

  return (
    <Card className={cn(
      'group hover:shadow-lg transition-all duration-200 cursor-pointer',
      cardVariants[variant],
      isInComparison && 'ring-2 ring-blue-500 ring-offset-2',
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {catalogItem.name}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {getCardTypeDisplay(catalogItem.card_type)} • Series {catalogItem.series}
          </p>
        </div>
        
        {showOwnership && (
          <div className="flex items-center space-x-2">
            {isOwned ? (
              <Badge variant="success">Owned</Badge>
            ) : (
              <Badge variant="outline">Available</Badge>
            )}
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className={cn('grid gap-4', gridClasses[variant])}>
        {/* Stats */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Rarity</span>
            <Badge variant={
              catalogItem.rarity === 4 ? 'destructive' :
              catalogItem.rarity === 3 ? 'secondary' :
              catalogItem.rarity === 2 ? 'default' : 'outline'
            }>
              {getRarityDisplay(catalogItem.rarity)}
            </Badge>
          </div>
          
          {catalogItem.cc_price && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Price</span>
              <span className="text-sm font-semibold text-gray-900">
                {formatNumber(catalogItem.cc_price)} CC
              </span>
            </div>
          )}
          
          {asset && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Level</span>
                <span className="text-sm font-semibold text-gray-900">
                  {asset.level}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Cards</span>
                <span className="text-sm font-semibold text-gray-900">
                  {asset.card_count}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Additional Details */}
        {variant === 'detailed' && (
          <div className="space-y-3">
            {catalogItem.tag_name && (
              <div>
                <span className="text-sm font-medium text-gray-700 block mb-1">Type</span>
                <p className="text-sm text-gray-600">{catalogItem.tag_name}</p>
              </div>
            )}
            
            {catalogItem.car_part_type !== null && (
              <div>
                <span className="text-sm font-medium text-gray-700 block mb-1">Car Part Category</span>
                <p className="text-sm text-gray-600">
                  {catalogItem.car_part_type === 0 ? 'Engine' :
                   catalogItem.car_part_type === 1 ? 'Transmission' :
                   catalogItem.car_part_type === 2 ? 'Suspension' :
                   catalogItem.car_part_type === 3 ? 'Aerodynamics' : 'Unknown'}
                </p>
              </div>
            )}
            
            {catalogItem.stats_per_level && Object.keys(catalogItem.stats_per_level).length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-700 block mb-2">Stats per Level</span>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(catalogItem.stats_per_level).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="font-medium">{value as number}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {onCompare && (
              <Button
                variant={isInComparison ? 'primary' : 'outline'}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onCompare(catalogItem as CatalogItem);
                }}
              >
                {isInComparison ? 'Remove' : 'Compare'}
              </Button>
            )}
          </div>
          
          <div className="flex space-x-2">
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
                Add to Collection
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Boost specific details */}
      {boost && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500 space-y-1">
            <div><strong>Boost Stats:</strong> {Object.keys(boost.boost_stats || {}).length} categories</div>
          </div>
        </div>
      )}
    </Card>
  );
}
