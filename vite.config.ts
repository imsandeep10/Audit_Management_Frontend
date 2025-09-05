import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    open: true,
    allowedHosts: ["localhost", "127.0.0.1","audit-management-system-admin.onrender.com"],
  },
  optimizeDeps: {
    include: ['pdfjs-dist'],
  },
});
