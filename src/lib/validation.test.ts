import { updateSeasonSchema } from './validation'

describe('updateSeasonSchema', () => {
  it('accepts season_number as positive integer', () => {
    const data = { season_number: 7 }
    const result = updateSeasonSchema.safeParse(data)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.season_number).toBe(7)
    }
  })

  it('accepts start_date in YYYY-MM-DD format', () => {
    const data = { start_date: '2026-03-20' }
    const result = updateSeasonSchema.safeParse(data)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.start_date).toBe('2026-03-20')
    }
  })

  it('rejects invalid start_date format', () => {
    const data = { start_date: '03/20/2026' }
    const result = updateSeasonSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('rejects non-positive season_number', () => {
    const data = { season_number: 0 }
    const result = updateSeasonSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('accepts season_number and start_date together', () => {
    const data = { season_number: 7, start_date: '2026-03-20' }
    const result = updateSeasonSchema.safeParse(data)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.season_number).toBe(7)
      expect(result.data.start_date).toBe('2026-03-20')
    }
  })

  it('still accepts name, is_active, and content_cache_loaded', () => {
    const data = {
      name: 'Season 7',
      is_active: false,
      content_cache_loaded: true,
    }
    const result = updateSeasonSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('allows empty object (all fields optional)', () => {
    const result = updateSeasonSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})
