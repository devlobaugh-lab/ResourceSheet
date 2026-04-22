import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CarPartSelectionGrid } from './CarPartSelectionGrid'

describe('CarPartSelectionGrid', () => {
  const mockPart = {
    id: '1',
    name: 'Test Part',
    rarity: 3,
    level: 5,
    card_count: 0,
    car_part_type: 6,
    series: 1,
    stats_per_level: [
      { speed: 10, cornering: 10, powerUnit: 10, qualifying: 10, drs: 0, overtake: 0, powerBoostImpact: 5, powerBoostDuration: 10, powerBoostRechargeRate: 8, pitStopTime: 2.0 },
      { speed: 11, cornering: 11, powerUnit: 11, qualifying: 11, drs: 0, overtake: 0, powerBoostImpact: 6, powerBoostDuration: 11, powerBoostRechargeRate: 9, pitStopTime: 1.95 },
      { speed: 12, cornering: 12, powerUnit: 12, qualifying: 12, drs: 0, overtake: 0, powerBoostImpact: 7, powerBoostDuration: 12, powerBoostRechargeRate: 10, pitStopTime: 1.9 },
      { speed: 13, cornering: 13, powerUnit: 13, qualifying: 13, drs: 0, overtake: 0, powerBoostImpact: 8, powerBoostDuration: 13, powerBoostRechargeRate: 11, pitStopTime: 1.85 },
      { speed: 14, cornering: 14, powerUnit: 14, qualifying: 14, drs: 0, overtake: 0, powerBoostImpact: 9, powerBoostDuration: 14, powerBoostRechargeRate: 12, pitStopTime: 1.8 },
    ],
  }

  const mockNonBatteryPart = {
    ...mockPart,
    car_part_type: 1,
    stats_per_level: [
      { speed: 10, cornering: 10, powerUnit: 10, qualifying: 10, drs: 5, overtake: 0, powerBoostImpact: 0, powerBoostDuration: 0, powerBoostRechargeRate: 0, pitStopTime: 2.0 },
    ],
  }

  it('should render a PB stats sub-row for Battery parts in FY26', () => {
    render(
      <CarPartSelectionGrid
        parts={[mockPart]}
        partType={6}
        seasonNumber={7}
        selectedPartId=""
        onPartSelect={vi.fn()}
        bonusCheckedItems={new Set()}
        onBonusToggle={vi.fn()}
        bonusPercentage="0"
        bonusOnlyMode={false}
        showHighestLevel={false}
      />
    )

    const subRow = screen.getByText(/PB Impact:/)
    expect(subRow).toBeInTheDocument()
    expect(subRow.textContent).toMatch(/PB Duration:/)
    expect(subRow.textContent).toMatch(/PB Charge:/)
  })

  it('should NOT render a PB stats sub-row for non-Battery parts', () => {
    render(
      <CarPartSelectionGrid
        parts={[mockNonBatteryPart]}
        partType={1}
        seasonNumber={7}
        selectedPartId=""
        onPartSelect={vi.fn()}
        bonusCheckedItems={new Set()}
        onBonusToggle={vi.fn()}
        bonusPercentage="0"
        bonusOnlyMode={false}
        showHighestLevel={false}
      />
    )

    expect(screen.queryByText(/PB Impact:/)).not.toBeInTheDocument()
  })

  it('should NOT render PB stats sub-row for Battery parts in pre-FY26 seasons', () => {
    render(
      <CarPartSelectionGrid
        parts={[mockPart]}
        partType={6}
        seasonNumber={6}
        selectedPartId=""
        onPartSelect={vi.fn()}
        bonusCheckedItems={new Set()}
        onBonusToggle={vi.fn()}
        bonusPercentage="0"
        bonusOnlyMode={false}
        showHighestLevel={false}
      />
    )

    expect(screen.queryByText(/PB Impact:/)).not.toBeInTheDocument()
  })
})
