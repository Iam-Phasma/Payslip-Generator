import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/Payslip-Generator/" : "/",
  build: {
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), "index.html"),
        dashboard: resolve(process.cwd(), "dashboard/dashboard.html"),
      },
    },
  },
  server: {
    open: true
  }
}));
