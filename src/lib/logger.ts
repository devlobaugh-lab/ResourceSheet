/**
 * Centralized logging utility
 * Provides structured logging with environment awareness
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'
type LogLevelName = 'debug' | 'info' | 'warn' | 'error' | 'off'

const LEVEL_ORDER: Record<LogLevelName, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  off: 4,
}

// Capture native console before any override
const nativeConsole = {
  log: globalThis.console.log.bind(globalThis.console),
  info: globalThis.console.info.bind(globalThis.console),
  warn: globalThis.console.warn.bind(globalThis.console),
  error: globalThis.console.error.bind(globalThis.console),
  debug: globalThis.console.debug.bind(globalThis.console),
}

/**
 * Logger utility for structured logging
 */
class Logger {
  private get effectiveLevel(): LogLevelName {
    const envLevel = process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevelName | undefined
    if (envLevel && envLevel in LEVEL_ORDER) return envLevel
    return process.env.NODE_ENV === 'production' ? 'off' : 'debug'
  }

  private shouldLog(level: LogLevelName): boolean {
    return LEVEL_ORDER[level] >= LEVEL_ORDER[this.effectiveLevel]
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
    if (this.shouldLog('debug')) {
      const prefix = this.getPrefix('debug')
      nativeConsole.debug(`${prefix} ${message}`, data || '')
    }
  }

  /**
   * Log an info message
   */
  info(message: string, data?: unknown): void {
    if (this.shouldLog('info')) {
      const prefix = this.getPrefix('info')
      nativeConsole.log(`${prefix} ${message}`, data || '')
    }
  }

  /**
   * Log a warning message
   */
  warn(message: string, data?: unknown): void {
    if (this.shouldLog('warn')) {
      const prefix = this.getPrefix('warn')
      nativeConsole.warn(`${prefix} ${message}`, data || '')
    }
  }

  /**
   * Log an error message
   */
  error(message: string, error?: unknown): void {
    if (this.shouldLog('error')) {
      const prefix = this.getPrefix('error')
      if (error instanceof Error) {
        nativeConsole.error(`${prefix} ${message}`, {
          message: error.message,
          stack: error.stack,
        })
      } else {
        nativeConsole.error(`${prefix} ${message}`, error || '')
      }
    }
  }

  /**
   * Log API request (development only)
   */
  logRequest(method: string, path: string, userId?: string): void {
    if (this.shouldLog('debug')) {
      const userInfo = userId ? ` (user: ${userId})` : ''
      this.debug(`${method} ${path}${userInfo}`)
    }
  }

  /**
   * Log API response (development only)
   */
  logResponse(method: string, path: string, statusCode: number, duration?: number): void {
    if (this.shouldLog('debug')) {
      const durationStr = duration ? ` (${duration}ms)` : ''
      const emoji = statusCode < 400 ? '✅' : '❌'
      this.debug(`${emoji} ${method} ${path} → ${statusCode}${durationStr}`)
    }
  }

  /**
   * Log database operation
   */
  logDatabase(operation: string, table: string, duration?: number): void {
    if (this.shouldLog('debug')) {
      const durationStr = duration ? ` (${duration}ms)` : ''
      this.debug(`🗄️  ${operation} on ${table}${durationStr}`)
    }
  }

  /**
   * Override globalThis.console so all bare console.* calls respect the log level.
   * Must be called early in both server and client lifecycles.
   */
  overrideConsole(): void {
    globalThis.console = {
      ...globalThis.console,
      log: (...args: unknown[]) => { if (this.shouldLog('info')) nativeConsole.log(...args) },
      info: (...args: unknown[]) => { if (this.shouldLog('info')) nativeConsole.info(...args) },
      warn: (...args: unknown[]) => { if (this.shouldLog('warn')) nativeConsole.warn(...args) },
      error: (...args: unknown[]) => { if (this.shouldLog('error')) nativeConsole.error(...args) },
      debug: (...args: unknown[]) => { if (this.shouldLog('debug')) nativeConsole.debug(...args) },
    }
  }
}

/**
 * Global logger instance
 */
export const logger = new Logger()
