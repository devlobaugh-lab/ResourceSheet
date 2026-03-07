# Series Max Loadouts

## Overview
The Series Max Loadouts page displays the optimal car setups for each of the 12 series in the game, assuming max level parts. It shows the best parts for three different build types: Speed, Cornering, and Power Unit.

## Location
- **Page**: `/series-max-loadouts`
- **Navigation**: Reference menu → Series Max Loadouts
- **File**: `src/app/series-max-loadouts/page.tsx`

## Features

### Setup Types
For each series, three optimal setups are calculated:
1. **Speed** - Parts selected for maximum speed stat
2. **Cornering** - Parts selected for maximum cornering stat
3. **Power Unit** - Parts selected for maximum power unit stat

### Display Format
- Each series is displayed in its own table
- Tables have a fixed width of 700px for consistent appearance
- Dark gray header (`bg-gray-700`) matching the Car Parts page style
- Part names are displayed with rarity-based background colors

### Part Selection Logic
The algorithm selects the best part for each slot based on:
1. **Series availability**: Only parts with `car_parts.series <= seriesIndex + 1` are considered
   - Note: `car_parts.series` uses offset numbering where:
     - 0 = Starter parts (always available)
     - 1 = Parts for game series 0
     - 2 = Parts for game series 1
     - etc.
2. **Max level stats**: Uses the last entry in `stats_per_level` for each part
3. **Highest stat wins**: The part with the highest value for the target stat is selected

### Part Types (in display order)
1. Brake (car_part_type: 1)
2. Gearbox (car_part_type: 0)
3. Rear Wing (car_part_type: 5)
4. Front Wing (car_part_type: 4)
5. Suspension (car_part_type: 3)
6. Engine (car_part_type: 2)

## Data Sources
- **Car Parts API**: `/api/car-parts?limit=100`
- **Parts Table**: `car_parts` in Supabase

## Series Numbering
- Database stores series as indices 0-11
- Display shows "Series 1" through "Series 12" (index + 1)
- Series 12 in car_parts represents the "all parts unlocked" tier

## Technical Notes

### Car Parts Series Offset
The `car_parts.series` column uses offset numbering:
- For game series N, use `car_parts.series <= N + 1`
- This is because series 0 in car_parts is reserved for Starter parts

### Rarity Colors
Parts are displayed with background colors based on rarity:
- Rarity 0 (Common): `bg-gray-300`
- Rarity 1: `bg-blue-200`
- Rarity 2: `bg-orange-200`
- Rarity 3: `bg-purple-300`
- Rarity 4: `bg-yellow-300`
- Rarity 5: `bg-red-300`

## Future Enhancements
Potential improvements could include:
- Adding qualifying-focused builds
- Combined stat builds (e.g., Speed + Cornering)
- Integration with user's owned parts to show achievable vs theoretical setups