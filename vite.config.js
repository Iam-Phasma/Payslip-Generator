import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/Payslip-Generator/" : "/",
  server: {
    open: true
  }
}));
