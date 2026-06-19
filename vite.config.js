import { defineConfig } from 'vite';

export default defineConfig({
  // The app is the self-contained index.html at the project root; build from here.
  // (Was root:'src', but there is no src/index.html, which broke `vite build`.)
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
  }
});