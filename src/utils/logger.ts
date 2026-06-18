/**
 * Ultra-simple development-only logger
 * - Disabled in production
 * - Impossible to misuse
 */

const isDev = process.env.NODE_ENV === 'development';

const logger = {
  log(message: string, data?: unknown) {
    if (!isDev) return;
    if (data !== undefined) {
      console.log(message, data);
    } else {
      console.log(message);
    }
  },

  info(message: string, data?: unknown) {
    if (!isDev) return;
    if (data !== undefined) {
      console.info(message, data);
    } else {
      console.info(message);
    }
  },

  warn(message: string, data?: unknown) {
    if (!isDev) return;
    if (data !== undefined) {
      console.warn(message, data);
    } else {
      console.warn(message);
    }
  },

  /**
   * Error = application-level error (NOT crash)
   * Uses warn internally to avoid Next.js overlay
   */
  error(message: string, error?: unknown) {
    if (!isDev) return;

    if (error !== undefined) {
      console.warn(`❌ ${message}`, error);
    } else {
      console.warn(`❌ ${message}`);
    }
  },

  success(message: string, data?: unknown) {
    if (!isDev) return;
    if (data !== undefined) {
      console.log(`✅ ${message}`, data);
    } else {
      console.log(`✅ ${message}`);
    }
  },
};

export default logger;
