import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: "./index.html",
        lookup: "./lookup.html",
        about: "./about.html",
      },
    },
  },
});
