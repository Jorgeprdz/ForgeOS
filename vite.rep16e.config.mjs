import { defineConfig } from "vite";

export default defineConfig({
  server: {
    watch: {
      ignored: [
        "**/artifacts/**",
        "**/playwright-report/**",
        "**/test-results/**",
      ],
    },
  },
});
