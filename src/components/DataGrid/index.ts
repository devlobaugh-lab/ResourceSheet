/**
 * DataGrid Component Module
 * 
 * Exports the main DataGrid component along with utilities and sub-components.
 */

// Main component - will be added after refactoring
export { DataGrid } from './DataGrid';

// Sub-components
export { FreeBoostCheckbox } from './components/FreeBoostCheckbox';

// Hooks
export { useColumnStats } from './hooks/useColumnStats';

// Utilities
export { getStatBackgroundColor, getBoostValueColor, getRarityBackground } from './utils/colors';
export { SORT_PREFERENCES_KEY, getDefaultSortForGridType, loadSortPreferences, saveSortPreferences } from './utils/sorting';
export { getColumns, getDriverColumns, getPartsColumns, getBoostsColumns } from './utils/columns';

// Types
export type { 
  GridType, 
  FilterState, 
  ColumnDef, 
  FilterableItem,
  AssetItem,
  CatalogItemItem,
  BoostItem,
  DriverItem,
  CarPartItem,
  ColumnStats 
} from './types';