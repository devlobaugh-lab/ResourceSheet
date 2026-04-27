import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// Mirror the schema here so we can test it in isolation
const updateTrackSlotSchema = z.object({
  track_id: z.string().uuid().nullable().optional(),
  is_wet: z.boolean().optional(),
  is_ready: z.boolean().optional(),
  driver_1_id: z.string().uuid().nullable().optional(),
  driver_2_id: z.string().uuid().nullable().optional(),
  driver_1_boost_id: z.string().uuid().nullable().optional(),
  driver_2_boost_id: z.string().uuid().nullable().optional(),
  alt_driver_ids: z.array(z.string().uuid()).optional(),
  alt_boost_ids: z.array(z.string().uuid()).optional(),
  saved_setup_id: z.string().uuid().nullable().optional(),
  setup_notes: z.string().nullable().optional(),
  driver_1_tire_strategy: z.string().nullable().optional(),
  driver_2_tire_strategy: z.string().nullable().optional(),
  strategy_notes: z.string().nullable().optional(),
  laps_override: z.number().int().positive().nullable().optional(),
}).partial()

describe('updateTrackSlotSchema', () => {
  it('accepts laps_override as a positive integer', () => {
    const result = updateTrackSlotSchema.parse({ laps_override: 58 })
    expect(result.laps_override).toBe(58)
  })

  it('accepts laps_override as null', () => {
    const result = updateTrackSlotSchema.parse({ laps_override: null })
    expect(result.laps_override).toBeNull()
  })

  it('accepts laps_override as undefined (field absent)', () => {
    const result = updateTrackSlotSchema.parse({})
    expect(result.laps_override).toBeUndefined()
  })

  it('rejects laps_override of 0', () => {
    expect(() => updateTrackSlotSchema.parse({ laps_override: 0 })).toThrow()
  })

  it('rejects laps_override as a non-integer', () => {
    expect(() => updateTrackSlotSchema.parse({ laps_override: 58.5 })).toThrow()
  })
})
