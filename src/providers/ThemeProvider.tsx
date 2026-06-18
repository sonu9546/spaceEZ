'use client'

import { ThemeProvider } from "next-themes"
import { DEFAULT_THEME } from "@/config"

export default function AppThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"      // Adds class="dark" or class="light" to <html>
      defaultTheme={DEFAULT_THEME}   // default theme
      enableSystem={true}    // Allow "system" theme
    >
      {children}
    </ThemeProvider>
  )
}
