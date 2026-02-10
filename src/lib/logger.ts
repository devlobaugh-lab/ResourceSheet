/**
 * Centralized logging utility
 * Provides structured logging with environment awareness
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  timestamp: string
  message: string
  data?: unknown
}

/**
 * Logger utility for structured logging
 */
class Logger {
  /**
   * Format a log message for console output
   */
  private formatMessage(level: LogLevel, message: string, data?: unknown): string {
    const timestamp = new Date().toISOString()
    const dataStr = data ? ` | ${JSON.stringify(data)}` : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${dataStr}`
  }

  /**
   * Get emoji prefix for log level (for CLI output)
   */
  private getPrefix(level: LogLevel): string {
    const prefixes: Record<LogLevel, string> = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
    }
    return prefixes[level]
  }

  /**
   * Log a debug message (only in development)
   */
  debug(message: string, data?: unknown): void {
    if (process.env.NODE_ENV !== 'production') {
      const prefix = this.getPrefix('debug')
      console.debug(`${prefix} ${message}`, data || '')
    }
  }

  /**
   * Log an info message
   */
  info(message: string, data?: unknown): void {
    const prefix = this.getPrefix('info')
    console.log(`${prefix} ${message}`, data || '')
  }

  /**
   * Log a warning message
   */
  warn(message: string, data?: unknown): void {
    const prefix = this.getPrefix('warn')
    console.warn(`${prefix} ${message}`, data || '')
  }

  /**
   * Log an error message
   */
  error(message: string, error?: unknown): void {
    const prefix = this.getPrefix('error')
    if (error instanceof Error) {
      console.error(`${prefix} ${message}`, {
        message: error.message,
        stack: error.stack,
      })
    } else {
      console.error(`${prefix} ${message}`, error || '')
    }
  }

  /**
   * Log API request (development only)
   */
  logRequest(method: string, path: string, userId?: string): void {
    if (process.env.NODE_ENV !== 'production') {
      const userInfo = userId ? ` (user: ${userId})` : ''
      this.debug(`${method} ${path}${userInfo}`)
    }
  }

  /**
   * Log API response (development only)
   */
  logResponse(method: string, path: string, statusCode: number, duration?: number): void {
    if (process.env.NODE_ENV !== 'production') {
      const durationStr = duration ? ` (${duration}ms)` : ''
      const emoji = statusCode < 400 ? '✅' : '❌'
      this.debug(`${emoji} ${method} ${path} → ${statusCode}${durationStr}`)
    }
  }

  /**
   * Log database operation
   */
  logDatabase(operation: string, table: string, duration?: number): void {
    if (process.env.NODE_ENV !== 'production') {
      const durationStr = duration ? ` (${duration}ms)` : ''
      this.debug(`🗄️  ${operation} on ${table}${durationStr}`)
    }
  }
}

/**
 * Global logger instance
 */
export const logger = new Logger()
