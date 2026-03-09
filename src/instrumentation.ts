export async function register() {
  const { logger } = await import('./lib/logger')
  logger.overrideConsole()
}
