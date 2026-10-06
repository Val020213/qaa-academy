// The button that switches the language. It shows the code of the language
// you will get when you click it ("ES" while the site is in English).

import { Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import { t, type Locale } from "@/lib/i18n"

interface LanguageToggleProps {
  locale: Locale
  onChange: (locale: Locale) => void
}

export function LanguageToggle({ locale, onChange }: LanguageToggleProps) {
  const other: Locale = locale === "en" ? "es" : "en"
  const label = t("locale.switch")

  return (
    <Button
      type="button"
      variant="outline"
      size="default"
      onClick={() => onChange(other)}
      aria-label={label}
      title={label}
      className="font-mono text-xs"
      data-testid="locale-toggle"
    >
      <Languages />
      <span>{other.toUpperCase()}</span>
    </Button>
  )
}
