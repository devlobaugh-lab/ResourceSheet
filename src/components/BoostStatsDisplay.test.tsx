import { render, screen } from '@testing-library/react'
import { BoostStatsDisplay } from './BoostStatsDisplay'

describe('BoostStatsDisplay', () => {
  it('renders nothing when boostStats is null', () => {
    const { container } = render(<BoostStatsDisplay boostStats={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when all stats are zero', () => {
    const { container } = render(
      <BoostStatsDisplay boostStats={{ power_boost_impact: 0, power_boost_duration: 0, power_boost_recharge_rate: 0 }} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders PB Impact when tier > 0', () => {
    render(<BoostStatsDisplay boostStats={{ power_boost_impact: 3 }} />)
    expect(screen.getByText('+15')).toBeInTheDocument()
  })

  it('renders PB Duration when tier > 0', () => {
    render(<BoostStatsDisplay boostStats={{ power_boost_duration: 2 }} />)
    expect(screen.getByText('+10')).toBeInTheDocument()
  })

  it('renders PB Recharge when tier > 0', () => {
    render(<BoostStatsDisplay boostStats={{ power_boost_recharge_rate: 1 }} />)
    expect(screen.getByText('+5')).toBeInTheDocument()
  })

  it('hides PB stats when tier is absent', () => {
    render(<BoostStatsDisplay boostStats={{ speed: 2 }} />)
    expect(screen.queryByText('+10')).not.toBeNull()
    // PB stats should not appear
    const content = document.body.textContent
    expect(content).not.toContain('+0')
  })

  it('renders multiple new power boost stats simultaneously', () => {
    render(
      <BoostStatsDisplay boostStats={{ power_boost_impact: 2, power_boost_duration: 3, power_boost_recharge_rate: 1 }} />
    )
    expect(screen.getByText('+10')).toBeInTheDocument()
    expect(screen.getByText('+15')).toBeInTheDocument()
    expect(screen.getByText('+5')).toBeInTheDocument()
  })
})
