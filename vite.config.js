import { defineConfig } from "vite";
import { copyFileSync } from "node:fs";
import { resolve } from "node:path";
export default defineConfig({
  base: "./",
  plugins: [
    {
      name: "portfolio-orbit-entry",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url?.split("?")[0] === "/portfolio-orbit.html")
            req.url = req.url.replace("/portfolio-orbit.html", "/index.html");
          next();
        });
      },
      writeBundle(options) {
        const dir = resolve(options.dir || "dist");
        copyFileSync(
          resolve(dir, "index.html"),
          resolve(dir, "portfolio-orbit.html"),
        );
      },
    },
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three", "three/addons/controls/OrbitControls.js"],
        },
      },
    },
  },
});
