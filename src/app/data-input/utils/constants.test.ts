import { PART_TYPE_NAMES, PART_TYPE_ORDER } from './constants'

describe('PART_TYPE_NAMES', () => {
  it('maps type 6 to Battery', () => {
    expect(PART_TYPE_NAMES[6]).toBe('Battery')
  })

  it('still maps original 6 part types correctly', () => {
    expect(PART_TYPE_NAMES[0]).toBe('Gearbox')
    expect(PART_TYPE_NAMES[1]).toBe('Brakes')
    expect(PART_TYPE_NAMES[2]).toBe('Engine')
    expect(PART_TYPE_NAMES[3]).toBe('Suspension')
    expect(PART_TYPE_NAMES[4]).toBe('Front Wing')
    expect(PART_TYPE_NAMES[5]).toBe('Rear Wing')
  })
})

describe('PART_TYPE_ORDER', () => {
  it('assigns Battery (type 6) sort position 6', () => {
    expect(PART_TYPE_ORDER[6]).toBe(6)
  })

  it('Battery sorts after all existing part types', () => {
    const maxExistingOrder = Math.max(...[0, 1, 2, 3, 4, 5].map(t => PART_TYPE_ORDER[t]))
    expect(PART_TYPE_ORDER[6]).toBeGreaterThan(maxExistingOrder)
  })
})
