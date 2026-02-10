/**
 * Environment variable validation and type-safe access
 * Ensures all required environment variables are present at startup
 */

import { logger } from './logger'

/**
 * Represents the application's environment configuration
 */
export interface EnvironmentConfig {
  // Supabase Configuration
  supabaseUrl: string
  supabaseAnonKey: string
  supabaseServiceRoleKey: string

  // Application Configuration
  nodeEnv: 'development' | 'production' | 'test'
  isDevelopment: boolean
  isProduction: boolean

  // Feature Flags
  authProvider: 'middleware' | 'client'
}

/**
 * Validate that all required environment variables are set
 * Throws an error if any required variable is missing
 */
function validateEnvironment(): EnvironmentConfig {
  const missingVars: string[] = []

  // Check required variables
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ]

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName)
    }
  }

  // If in production, be strict about missing variables
  if (process.env.NODE_ENV === 'production' && missingVars.length > 0) {
    const message = `Missing required environment variables: ${missingVars.join(', ')}`
    logger.error(message)
    throw new Error(message)
  }

  // In development, warn but continue
  if (missingVars.length > 0) {
    logger.warn(`Missing environment variables: ${missingVars.join(', ')}`)
  }

  const nodeEnv = (process.env.NODE_ENV || 'development') as EnvironmentConfig['nodeEnv']

  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder',
    nodeEnv,
    isDevelopment: nodeEnv === 'development',
    isProduction: nodeEnv === 'production',
    authProvider: (process.env.AUTH_PROVIDER as EnvironmentConfig['authProvider']) || 'middleware',
  }
}

/**
 * Get the validated environment configuration
 * This is called once at startup
 */
export const env = validateEnvironment()
