import 'antd/dist/reset.css'
import '../styles/global.css'

import { ReactNode } from 'react'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line camelcase
import { Inter, Poppins, Roboto, Plus_Jakarta_Sans} from 'next/font/google'
import Script from 'next/script'
import Providers from './providers'   // <-- client wrapper
import InstallPrompt from '@/components/features/pwa/InstallPrompt'
import ServiceWorkerRegistration from '@/components/features/pwa/ServiceWorkerRegistration'
import VersionUpdateNotification from '@/components/features/version/VersionUpdateNotification'
import OnlineStatusManager from '@/components/features/pwa/OnlineStatusManager'
import TopLoadingBar from '@/components/ui/feedback/TopLoadingBar'
import WakeLockProvider from '@/components/providers/WakeLockProvider'
import SplashScreen from '@/components/ui/feedback/SplashScreen'
import { DEFAULT_LANGUAGE, SHOW_INSTALL_PROMPT, SHOW_VERSION_UPDATE_NOTIFICATION } from '@/config'



// ---------- SEO METADATA ----------
export const metadata = {
  metadataBase: new URL("https://spaceez.com"),
  title: {
    default: "SpaceEZ | Venue Management & Booking System",
    template: "%s | SpaceEZ",
  },
  description:
    "SpaceEZ provides expert venue management, booking system, and reservation solutions.",
  robots: "index, follow",
  alternates: { canonical: "https://spaceez.com" },
  openGraph: {
    title: "SpaceEZ",
    description: "Venue Management & Booking System Experts",
    url: "https://spaceez.com",
    siteName: "SpaceEZ",
    images: [{ url: "/og-image.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SpaceEZ",
    description: "Build modern venue booking solutions.",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SpaceEZ",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
}

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

// ---------- FONTS ----------
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
})

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-roboto',
})

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta-sans',
})

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={DEFAULT_LANGUAGE} suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />

        {/* EXTERNAL ERROR SHIELD - Suppresses extension-injected SyntaxErrors */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window !== 'undefined') {
                  var handleExternalError = function(msg) {
                    if (msg && (
                      msg.includes('input:not[type=hidden]') || 
                      (msg.includes('querySelector') && msg.includes('not a valid selector'))
                    )) {
                      console.warn('🛡️ Dev Shield: Suppressed external error:', msg);
                      return true;
                    }
                    return false;
                  };

                  var originalError = window.onerror;
                  window.onerror = function(m, s, l, c, e) {
                    if (handleExternalError(m)) return true;
                    if (originalError) return originalError.apply(window, arguments);
                  };

                  window.addEventListener('unhandledrejection', function(event) {
                    var m = event.reason ? (event.reason.message || event.reason.toString()) : '';
                    if (handleExternalError(m)) {
                      event.preventDefault();
                      event.stopPropagation();
                    }
                  }, true);
                }
              })();
            `
          }}
        />
        {/* JSON-LD STRUCTURED DATA */}
        <Script
          id="schema-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "SpaceEZ",
              url: "https://spaceez.com",
            }),
          }}
        />
      </head>

      <body id="app" className={`${inter.variable} ${poppins.variable} ${roboto.variable} ${plusJakartaSans.variable}`}>
        <Providers>
          <ServiceWorkerRegistration />
          <OnlineStatusManager />
          <TopLoadingBar />
          <WakeLockProvider />
          {SHOW_INSTALL_PROMPT && <InstallPrompt />}
          <SplashScreen>
            {children}
          </SplashScreen>
          {SHOW_VERSION_UPDATE_NOTIFICATION && <VersionUpdateNotification />}
        </Providers>
      </body>
    </html>
  )
}
