// Entry point. It draws the <App /> component inside <div id="root"> of index.html.

import "@fontsource-variable/geist"
import "@fontsource-variable/geist-mono"
import "./index.css"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./App.tsx"

const root = document.querySelector<HTMLDivElement>("#root")
if (!root) throw new Error('The <div id="root"> element is missing in index.html')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
)
