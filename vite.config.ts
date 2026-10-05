import { defineConfig } from "vite"

// Fixed port: if 5180 is taken, Vite fails instead of silently moving to
// another port (the Playwright tests would then point at the wrong app).
export default defineConfig({
  server: { port: 5180, strictPort: true },
  preview: { port: 5180, strictPort: true },
})
