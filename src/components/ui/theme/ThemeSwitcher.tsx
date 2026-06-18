'use client'

import { Switch } from "antd"
import { useTheme } from "next-themes"

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  return (
    <Switch checked={theme === "dark"} onChange={() => setTheme(theme === "dark" ? "light" : "dark")} checkedChildren="🌞" unCheckedChildren="🌑" />
  )
}
