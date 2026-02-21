import { useMemo } from 'react';

/**
 * Calculate min, max, median for numeric columns
 */
export const useColumnStats = <T extends Record<string, any>>(
  data: T[],
  numericColumns: string[]
) => {
  return useMemo(() => {
    const stats: Record<string, { min: number; max: number; median: number }> = {};

    numericColumns.forEach(column => {
      const values = data
        .map(item => item[column])
        .filter((v): v is number => typeof v === 'number' && !isNaN(v))
        .sort((a, b) => a - b);

      if (values.length > 0) {
        stats[column] = {
          min: values[0],
          max: values[values.length - 1],
          median: values[Math.floor(values.length / 2)]
        };
      }
    });

    return stats;
  }, [data, numericColumns]);
};