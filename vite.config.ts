import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { compression } from 'vite-plugin-compression2';

export default defineConfig({
  plugins: [
    tailwindcss(),
    TanStackRouterVite({
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts'
    }),
    react({
      jsxRuntime: 'automatic'
    }),
    compression({
      algorithm: 'gzip',
      include: /\.(js|ts|css|html)$/,
      exclude: /constellation-core.*\.js|bootstrap-shell\.js/,
      threshold: 10240
    }),
    compression({
      algorithm: 'brotliCompress',
      include: /\.(js|ts|css|html|svg)$/,
      exclude: /constellation-core.*\.js|bootstrap-shell\.js/,
      threshold: 10240
    })
  ],
  server: {
    port: 3502,
    open: false
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx']
  },
  build: {
    outDir: 'dist'
  },
  define: {
    global: 'window'
  }
});
