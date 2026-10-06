// Icons from the Lucide set (https://lucide.dev).
//
// React components use the icons directly:  <Rocket />
// Lesson text is Markdown turned into an HTML string, so it cannot hold React
// components. For that case `iconHtml()` gives the icon as an <svg> string.

import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import {
  ArrowRight,
  BookOpen,
  Brain,
  CircleHelp,
  Code,
  FlaskConical,
  Globe,
  Info,
  Layers,
  Lightbulb,
  Mountain,
  PencilLine,
  Puzzle,
  Rocket,
  Search,
  ShieldCheck,
  Store,
  Target,
  TriangleAlert,
} from "lucide-react"

export const icons = {
  "arrow-right": ArrowRight,
  "book-open": BookOpen,
  brain: Brain,
  "circle-help": CircleHelp,
  code: Code,
  flask: FlaskConical,
  globe: Globe,
  info: Info,
  layers: Layers,
  lightbulb: Lightbulb,
  mountain: Mountain,
  pencil: PencilLine,
  puzzle: Puzzle,
  rocket: Rocket,
  search: Search,
  "shield-check": ShieldCheck,
  store: Store,
  target: Target,
  warning: TriangleAlert,
}

export type IconName = keyof typeof icons

/** The <svg> markup of an icon. It takes the colour of the text around it. */
export function iconHtml(name: IconName, size = 16): string {
  return renderToStaticMarkup(
    createElement(icons[name], { size, "aria-hidden": true })
  )
}
