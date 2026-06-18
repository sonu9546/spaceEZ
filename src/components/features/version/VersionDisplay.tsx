'use client'

import { useEffect, useState } from 'react'
import type { VersionInfo } from '@/config/version.config'

export default function VersionDisplay() {
    const [version, setVersion] = useState<VersionInfo | null>(null)

    useEffect(() => {
        // Fetch version info
        fetch('/version.json')
            .then((res) => res.json())
            .then((data: VersionInfo) => setVersion(data))
            .catch(() => setVersion(null))
    }, [])

    if (!version) {
        return null
    }

    return (
        <div className="text-xs text-muted-foreground">
            v{version.version} • Build {version.buildId.slice(-8)}
        </div>
    )
}
