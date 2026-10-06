// The button that switches between the light and the dark theme.
// It shows the icon of the theme you will get when you click it.

import { useState } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { t } from "@/lib/i18n"
import { currentTheme, setTheme, type Theme } from "@/lib/theme"

export function ThemeToggle() {
  const [theme, setThemeState] = useState<Theme>(currentTheme)

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark"
    setTheme(next)
    setThemeState(next)
  }

  const label = theme === "dark" ? t("theme.toLight") : t("theme.toDark")

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggle}
      aria-label={label}
      title={label}
      data-testid="theme-toggle"
    >
      {theme === "dark" ? <Sun /> : <Moon />}
    </Button>
  )
}
