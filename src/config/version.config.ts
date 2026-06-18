export interface VersionInfo {
    version: string
    buildId: string
    timestamp: string
    buildDate: string
}

export const VERSION_CONFIG = {
    // Check for updates every 5 minutes
    CHECK_INTERVAL: 5 * 60 * 1000,

    // Only enable in production
    ENABLED: process.env.NODE_ENV === 'production',

    // Auto refresh countdown in seconds (0 to disable)
    AUTO_REFRESH_DELAY: 0,

    // Show notification
    SHOW_NOTIFICATION: true,

    // Version file path
    VERSION_FILE: '/version.json',

    // Storage key for current version
    STORAGE_KEY: 'app_version',
}
