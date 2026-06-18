const fs = require('fs')
const path = require('path')

// Generate version info
const version = {
    version: process.env.npm_package_version || '1.0.0',
    buildId: new Date().getTime().toString(),
    timestamp: new Date().toISOString(),
    buildDate: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }),
}

// Write to public directory
const publicDir = path.join(__dirname, '../public')
const versionFile = path.join(publicDir, 'version.json')

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
}

// Write version file
fs.writeFileSync(versionFile, JSON.stringify(version, null, 2))

console.log('\n' + '='.repeat(60))
console.log('🚀 BUILD VERSION GENERATED')
console.log('='.repeat(60))
console.log('📦 Version:', version.version)
console.log('🔢 Build ID:', version.buildId)
console.log('📅 Build Date:', version.buildDate)
console.log('⏰ Timestamp:', version.timestamp)
console.log('='.repeat(60) + '\n')
