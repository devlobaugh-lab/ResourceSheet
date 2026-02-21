import { UserAssetView, CatalogItem, Boost, BoostWithCustomName, DriverView, CarPartView } from '@/types/database';

/**
 * Grid type definitions
 */
export type GridType = 'drivers' | 'parts' | 'boosts' | 'car-parts';

/**
 * Filter state for DataGrid
 */
export interface FilterState {
  search: string;
  maxSeries: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

/**
 * Column definition for DataGrid
 */
export interface ColumnDef {
  key: string;
  label: string;
  sortable: boolean;
}

/**
 * Extended types for unified filtering
 */
export interface AssetItem extends UserAssetView {
  is_asset: true;
}

export interface CatalogItemItem extends CatalogItem {
  is_asset: false;
}

export interface BoostItem extends BoostWithCustomName {
  is_boost: true;
  card_count: number;
}

export interface DriverItem extends DriverView {
  is_driver: true;
}

export interface CarPartItem extends CarPartView {
  is_car_part: true;
}

export type FilterableItem = AssetItem | CatalogItemItem | BoostItem | DriverItem | CarPartItem;

/**
 * Column statistics for color coding
 */
export interface ColumnStats {
  [key: string]: {
    min: number;
    max: number;
    median: number;
  };
}