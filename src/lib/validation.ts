import { z } from 'zod'

// Common schemas
export const uuidSchema = z.string().uuid()
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
})

// Catalog Item schemas
export const createCatalogItemSchema = z.object({
  name: z.string().min(1),
  card_type: z.number().int().min(0).max(1),
  rarity: z.number().int().min(0),
  series: z.number().int().min(0),
  season_id: uuidSchema.optional().nullable(),
  icon: z.string().optional().nullable(),
  cc_price: z.number().int().optional().nullable(),
  num_duplicates_after_unlock: z.number().int().optional().nullable(),
  collection_id: z.string().optional().nullable(),
  visual_override: z.string().optional().nullable(),
  collection_sub_name: z.string().optional().nullable(),
  car_part_type: z.number().int().optional().nullable(),
  tag_name: z.string().optional().nullable(),
  ordinal: z.number().int().optional().nullable(),
  min_gp_tier: z.number().int().optional().nullable(),
  stats_per_level: z.any().optional().nullable(),
})

export const updateCatalogItemSchema = createCatalogItemSchema.partial()

export const catalogItemFiltersSchema = z.object({
  season_id: uuidSchema.optional().nullable(),
  card_type: z.union([z.number().int().min(0).max(1), z.string().regex(/^\d+$/).transform(val => parseInt(val, 10))]).optional(),
  rarity: z.union([z.number().int(), z.string().regex(/^\d+$/).transform(val => parseInt(val, 10))]).optional(),
  series: z.union([z.number().int(), z.string().regex(/^\d+$/).transform(val => parseInt(val, 10))]).optional(),
  search: z.string().optional(),
})

// User Item schemas
export const createUserItemSchema = z.object({
  catalog_item_id: uuidSchema,
  level: z.number().int().min(0).default(0),
  card_count: z.number().int().min(0).default(0),
})

export const updateUserItemSchema = z.object({
  level: z.number().int().min(0).optional(),
  card_count: z.number().int().min(0).optional(),
})

// Boost schemas
export const createBoostSchema = z.object({
  name: z.string().min(1),
  icon: z.string().optional().nullable(),
  boost_type: z.string().min(1),
  rarity: z.number().int().min(0),
  boost_stats: z.any().optional().nullable(),
  series: z.number().int().optional().nullable(),
  season_id: uuidSchema.optional().nullable(),
})

export const updateBoostSchema = createBoostSchema.partial()

// User Boost schemas
export const createUserBoostSchema = z.object({
  boost_id: uuidSchema,
  level: z.number().int().min(1).default(1),
})

export const updateUserBoostSchema = z.object({
  level: z.number().int().min(1).optional(),
})

// Season schemas
export const createSeasonSchema = z.object({
  name: z.string().min(1),
  is_active: z.boolean().default(false),
})

export const updateSeasonSchema = z.object({
  name: z.string().min(1).optional(),
  is_active: z.boolean().optional(),
})

// Profile schemas
export const updateProfileSchema = z.object({
  username: z.string().optional().nullable(),
  is_admin: z.boolean().optional(),
})

// User Assets schema (for the merged view)
export const userAssetsFiltersSchema = z.object({
  season_id: uuidSchema.optional(),
  card_type: z.number().int().min(0).max(1).optional(),
  rarity: z.number().int().optional(),
  series: z.number().int().optional(),
  search: z.string().optional(),
  owned_only: z.boolean().default(false),
  sort_by: z.enum(['name', 'rarity', 'series', 'level', 'card_count']).default('name'),
  sort_order: z.enum(['asc', 'desc']).default('asc'),
  ...paginationSchema.shape,
})

// Drivers schemas
export const driversFiltersSchema = z.object({
  season_id: uuidSchema.optional(),
  rarity: z.union([z.number().int(), z.string().regex(/^\d+$/).transform(val => parseInt(val, 10))]).optional(),
  series: z.union([z.number().int(), z.string().regex(/^\d+$/).transform(val => parseInt(val, 10))]).optional(),
  search: z.string().optional(),
  owned_only: z.union([z.boolean(), z.string().transform(val => val === 'true')]).default(false),
  sort_by: z.enum(['name', 'rarity', 'series', 'level']).default('name'),
  sort_order: z.enum(['asc', 'desc']).default('asc'),
  page: z.union([z.number().int().positive(), z.string().regex(/^\d+$/).transform(val => parseInt(val, 10))]).default(1),
  limit: z.union([z.number().int().positive().max(100), z.string().regex(/^\d+$/).transform(val => parseInt(val, 10))]).default(20),
})

// Car Parts schemas
export const carPartsFiltersSchema = z.object({
  season_id: uuidSchema.optional(),
  rarity: z.union([z.number().int(), z.string().regex(/^\d+$/).transform(val => parseInt(val, 10))]).optional(),
  series: z.union([z.number().int(), z.string().regex(/^\d+$/).transform(val => parseInt(val, 10))]).optional(),
  car_part_type: z.union([z.number().int(), z.string().regex(/^\d+$/).transform(val => parseInt(val, 10))]).optional(),
  search: z.string().optional(),
  owned_only: z.union([z.boolean(), z.string().transform(val => val === 'true')]).default(false),
  sort_by: z.enum(['name', 'rarity', 'series', 'level', 'car_part_type']).default('name'),
  sort_order: z.enum(['asc', 'desc']).default('asc'),
  page: z.union([z.number().int().positive(), z.string().regex(/^\d+$/).transform(val => parseInt(val, 10))]).default(1),
  limit: z.union([z.number().int().positive().max(100), z.string().regex(/^\d+$/).transform(val => parseInt(val, 10))]).default(20),
})

// Boosts schemas
export const boostsFiltersSchema = z.object({
  season_id: uuidSchema.optional(),
  rarity: z.number().int().optional(),
  series: z.number().int().optional(),
  search: z.string().optional(),
  owned_only: z.boolean().default(false),
  sort_by: z.enum(['name', 'rarity', 'series', 'level', 'boost_type']).default('name'),
  sort_order: z.enum(['asc', 'desc']).default('asc'),
  ...paginationSchema.shape,
})

// Export all schemas
export const schemas = {
  // Catalog Items
  createCatalogItem: createCatalogItemSchema,
  updateCatalogItem: updateCatalogItemSchema,
  catalogItemFilters: catalogItemFiltersSchema,
  
  // User Items
  createUserItem: createUserItemSchema,
  updateUserItem: updateUserItemSchema,
  
  // Boosts
  createBoost: createBoostSchema,
  updateBoost: updateBoostSchema,
  
  // User Boosts
  createUserBoost: createUserBoostSchema,
  updateUserBoost: updateUserBoostSchema,
  
  // Seasons
  createSeason: createSeasonSchema,
  updateSeason: updateSeasonSchema,
  
  // Profiles
  updateProfile: updateProfileSchema,
  
  // User Assets
  userAssetsFilters: userAssetsFiltersSchema,
  
  // Common
  pagination: paginationSchema,
  uuid: uuidSchema,
}
