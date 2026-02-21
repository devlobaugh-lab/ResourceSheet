import { ColumnDef, GridType } from '../types';

/**
 * Get columns for drivers grid
 */
export const getDriverColumns = (): ColumnDef[] => [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'rarity', label: 'Rarity', sortable: true },
  { key: 'user_level', label: 'Level', sortable: true },
  { key: 'bonus', label: 'Bonus', sortable: false },
  { key: 'overtaking', label: 'Overtaking', sortable: true },
  { key: 'blocking', label: 'Defending', sortable: true },
  { key: 'qualifying', label: 'Qualifying', sortable: true },
  { key: 'raceStart', label: 'Race Start', sortable: true },
  { key: 'tyreUse', label: 'Tyre Use', sortable: true },
  { key: 'total_value', label: 'Total Value', sortable: true },
  { key: 'series', label: 'Series', sortable: true },
];

/**
 * Get columns for parts grid
 */
export const getPartsColumns = (): ColumnDef[] => [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'rarity', label: 'Rarity', sortable: true },
  { key: 'user_level', label: 'Level', sortable: true },
  { key: 'bonus', label: 'Bonus', sortable: false },
  { key: 'car_part_type', label: 'Part Type', sortable: false },
  { key: 'speed', label: 'Speed', sortable: true },
  { key: 'cornering', label: 'Cornering', sortable: true },
  { key: 'powerUnit', label: 'Power Unit', sortable: true },
  { key: 'qualifying', label: 'Qualifying', sortable: true },
  { key: 'drs', label: 'DRS', sortable: true },
  { key: 'pitStopTime', label: 'Pit Stop', sortable: true },
  { key: 'total_value', label: 'Total Value', sortable: true },
  { key: 'series', label: 'Series', sortable: true },
];

/**
 * Get columns for boosts grid
 */
export const getBoostsColumns = (): ColumnDef[] => [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'card_count', label: 'Amount', sortable: true },
  { key: 'is_free', label: 'Free', sortable: true },
  { key: 'overtake', label: 'Overtake', sortable: true },
  { key: 'block', label: 'Defend', sortable: true },
  { key: 'corners', label: 'Corners', sortable: true },
  { key: 'tyre_use', label: 'Tyre Use', sortable: true },
  { key: 'power_unit', label: 'Power Unit', sortable: true },
  { key: 'speed', label: 'Speed', sortable: true },
  { key: 'pit_stop', label: 'Pit Stop', sortable: true },
  { key: 'race_start', label: 'Race Start', sortable: true },
];

/**
 * Get columns based on grid type
 */
export const getColumns = (gridType: GridType, hasActions: boolean): ColumnDef[] => {
  let columns: ColumnDef[] = [];

  switch (gridType) {
    case 'drivers':
      columns = getDriverColumns();
      break;
    case 'parts':
    case 'car-parts':
      columns = getPartsColumns();
      break;
    case 'boosts':
      columns = getBoostsColumns();
      break;
    default:
      columns = [{ key: 'name', label: 'Name', sortable: true }];
  }

  if (hasActions) {
    columns.push({ key: 'actions', label: 'Actions', sortable: false });
  }

  return columns;
};