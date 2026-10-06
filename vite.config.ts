import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// Fixed port: if 5180 is taken, Vite fails instead of silently moving to
// another port (the Playwright tests would then point at the wrong app).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // `@/` means the `src/` folder, so imports do not need long ../../ paths.
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
  server: { port: 5180, strictPort: true },
  preview: { port: 5180, strictPort: true },
})
