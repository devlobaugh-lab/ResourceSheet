'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { CatalogItem } from '@/types/database';
import { useCatalogItems, useAddUserItem } from '@/hooks/useApi';

interface AddAssetFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AddAssetForm({ onSuccess, onCancel }: AddAssetFormProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [level, setLevel] = useState(1);
  const [cardCount, setCardCount] = useState(1);
  
  const { data: catalogItems = [], isLoading } = useCatalogItems();
  const addUserItem = useAddUserItem();

  const filteredItems = catalogItems.filter((item: CatalogItem) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedItem) return;

    try {
      await addUserItem.mutateAsync({
        catalog_item_id: selectedItem.id,
        level,
        card_count: cardCount,
      });
      
      // Reset form
      setSelectedItem(null);
      setSearchTerm('');
      setLevel(1);
      setCardCount(1);
      
      onSuccess?.();
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const getRarityBadge = (rarity: number) => {
    const variants: Record<number, 'destructive' | 'secondary' | 'default' | 'outline'> = {
      4: 'destructive', // Legendary
      3: 'secondary',   // Epic
      2: 'default',     // Rare
      1: 'outline',     // Common
      0: 'outline',     // Basic
    };

    const labels = ['Basic', 'Common', 'Rare', 'Epic', 'Legendary'];

    return (
      <Badge variant={variants[rarity] || 'outline'} size="sm">
        {labels[rarity] || 'Unknown'}
      </Badge>
    );
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Item to Collection</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Search/Select Item */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Item
          </label>
          
          {!selectedItem ? (
            <>
              <Input
                placeholder="Search catalog items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-3"
              />
              
              {isLoading ? (
                <div className="text-center py-4 text-gray-500">Loading items...</div>
              ) : (
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                  {filteredItems.slice(0, 20).map((item: CatalogItem) => (
                    <button
                      key={item.id}
                      type="button"
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      onClick={() => {
                        setSelectedItem(item);
                        setSearchTerm('');
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">
                            Series {item.series} • {item.card_type === 0 ? 'Car Part' : 'Driver'}
                          </div>
                        </div>
                        {getRarityBadge(item.rarity)}
                      </div>
                    </button>
                  ))}
                  
                  {filteredItems.length === 0 && (
                    <div className="px-4 py-6 text-center text-gray-500">
                      {/* eslint-disable-next-line react/no-unescaped-entities */}
                      No items found matching "{searchTerm}"
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{selectedItem.name}</div>
                  <div className="text-sm text-gray-500">
                    Series {selectedItem.series} • {selectedItem.card_type === 0 ? 'Car Part' : 'Driver'}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getRarityBadge(selectedItem.rarity)}
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => setSelectedItem(null)}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Level Input */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Level"
            type="number"
            min={1}
            max={10}
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
            required
          />
          
          <Input
            label="Card Count"
            type="number"
            min={1}
            value={cardCount}
            onChange={(e) => setCardCount(Number(e.target.value))}
            required
          />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <Button
            type="submit"
            disabled={!selectedItem || addUserItem.isPending}
            isLoading={addUserItem.isPending}
            className="flex-1"
          >
            Add to Collection
          </Button>
          
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
        </div>

        {addUserItem.isError && (
          <div className="text-red-600 text-sm">
            Failed to add item. Please try again.
          </div>
        )}
      </form>
    </Card>
  );
}

interface BulkEntryFormProps {
  onSuccess?: () => void;
}

export function BulkEntryForm({ onSuccess }: BulkEntryFormProps) {
  const [items, setItems] = useState<Array<{
    catalogItemId: string;
    level: number;
    cardCount: number;
  }>>([{ catalogItemId: '', level: 1, cardCount: 1 }]);
  
  const { data: catalogItems = [] } = useCatalogItems();
  const addUserItem = useAddUserItem();

  const addItem = () => {
    setItems([...items, { catalogItemId: '', level: 1, cardCount: 1 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_: unknown, i: number) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    setItems(items.map((item: { catalogItemId: string; level: number; cardCount: number }, i: number) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validItems = items.filter(item => item.catalogItemId);
    
    if (validItems.length === 0) return;

    try {
      for (const item of validItems) {
        await addUserItem.mutateAsync({
          catalog_item_id: item.catalogItemId,
          level: item.level,
          card_count: item.cardCount,
        });
      }
      
      setItems([{ catalogItemId: '', level: 1, cardCount: 1 }]);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to add items:', error);
    }
  };

  const getItemName = (id: string) => {
    const item = catalogItems.find((i: CatalogItem) => i.id === id);
    return item?.name || 'Select item...';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Bulk Add Items</h3>
        <Button variant="ghost" size="sm" onClick={addItem}>
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Row
        </Button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 mb-6">
          {items.map((item: { catalogItemId: string; level: number; cardCount: number }, index: number) => (
            <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <select
                  className="w-full rounded-lg border-gray-300 text-sm"
                  value={item.catalogItemId}
                  onChange={(e) => updateItem(index, 'catalogItemId', e.target.value)}
                >
                  <option value="">Select item...</option>
                  {catalogItems.map((ci: CatalogItem) => (
                    <option key={ci.id} value={ci.id}>
                      {ci.name} (Series {ci.series})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="w-20">
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={item.level}
                  onChange={(e) => updateItem(index, 'level', Number(e.target.value))}
                  placeholder="Lv"
                />
              </div>
              
              <div className="w-20">
                <Input
                  type="number"
                  min={1}
                  value={item.cardCount}
                  onChange={(e) => updateItem(index, 'cardCount', Number(e.target.value))}
                  placeholder="Qty"
                />
              </div>
              
              {items.length > 1 && (
                <button
                  type="button"
                  className="text-gray-400 hover:text-red-600 p-2"
                  onClick={() => removeItem(index)}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex space-x-4">
          <Button
            type="submit"
            disabled={items.every(i => !i.catalogItemId) || addUserItem.isPending}
            isLoading={addUserItem.isPending}
          >
            Add {items.filter(i => i.catalogItemId).length} Item{items.filter(i => i.catalogItemId).length !== 1 ? 's' : ''}
          </Button>
        </div>
      </form>
    </Card>
  );
}