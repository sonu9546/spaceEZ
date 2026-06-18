import Image from 'next/image'
import React from 'react'

interface AppLogoProps {
    onClick?: () => void
}

const AppLogo = ({ onClick }: AppLogoProps) => {
    return (
        <Image
            priority
            alt="Logo"
            width={180}
            height={50}
            quality={100}
            src="/images/logo.png"
            className="cursor-pointer"
            onClick={() => onClick?.()}
            style={{ objectFit: 'contain' }}
        />
    )
}

export default AppLogo