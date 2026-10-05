// Icons from the Lucide set (https://lucide.dev). Each icon is a list of SVG
// shapes; `icon()` turns one into an <svg> string that views can put in HTML.

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CircleHelp,
  Clock,
  Code,
  FlaskConical,
  Globe,
  Info,
  Languages,
  Layers,
  Lightbulb,
  List,
  Moon,
  PencilLine,
  Rocket,
  Search,
  ShieldCheck,
  Store,
  Sun,
  Target,
  TriangleAlert,
  type IconNode,
} from "lucide"

const icons = {
  "arrow-left": ArrowLeft,
  "arrow-right": ArrowRight,
  "book-open": BookOpen,
  check: Check,
  "circle-help": CircleHelp,
  clock: Clock,
  code: Code,
  flask: FlaskConical,
  globe: Globe,
  info: Info,
  languages: Languages,
  layers: Layers,
  lightbulb: Lightbulb,
  list: List,
  moon: Moon,
  pencil: PencilLine,
  rocket: Rocket,
  search: Search,
  "shield-check": ShieldCheck,
  store: Store,
  sun: Sun,
  target: Target,
  warning: TriangleAlert,
} satisfies Record<string, IconNode>

export type IconName = keyof typeof icons

/** The <svg> markup of an icon. It takes the colour of the text around it. */
export function icon(name: IconName, size = 16): string {
  const shapes = icons[name]
    .map(([tag, attrs]) => {
      const attributes = Object.entries(attrs)
        .map(([key, value]) => `${key}="${value}"`)
        .join(" ")
      return `<${tag} ${attributes}/>`
    })
    .join("")

  return `<svg class="icon" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${shapes}</svg>`
}

// The GitHub mark is a brand logo, so it is not part of Lucide.
export const githubIcon = `<svg class="icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M8 0a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.93-.89-1.17-.89-1.17-.73-.5.05-.49.05-.49.8.06 1.23.83 1.23.83.72 1.22 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.77-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.19c0 .21.15.46.55.38A8 8 0 0 0 8 0Z"/></svg>`
