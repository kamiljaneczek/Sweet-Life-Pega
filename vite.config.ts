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
    open: false,
    sourcemapIgnoreList: (sourcePath) => sourcePath.includes('node_modules')
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx']
  },
  build: {
    outDir: 'dist'
  },
  optimizeDeps: {
    include: [
      '@mui/material',
      '@mui/utils',
      '@mui/system',
      '@emotion/react',
      '@emotion/styled',
      'mui-tel-input',
      'prop-types',
      'react-is',
      'hoist-non-react-statics',
      'dayjs',
      'dayjs/plugin/customParseFormat',
      'dayjs/plugin/localizedFormat',
      'dayjs/plugin/relativeTime',
      'dayjs/plugin/timezone',
      'dayjs/plugin/utc',
      'dayjs/plugin/advancedFormat',
      'dayjs/plugin/isBetween',
      'dayjs/plugin/weekOfYear',
      'dayjs/plugin/quarterOfYear',
      'downloadjs',
      'fast-deep-equal',
      'fast-deep-equal/react',
      'use-sync-external-store/shim',
      'use-sync-external-store/shim/with-selector',
      'lodash.difference',
      'lodash.clonedeep',
      'clsx',
      'react-number-format',
      'react-datepicker',
      'throttle-debounce',
      '@loadable/component',
      '@tinymce/tinymce-react',
      '@react-google-maps/api',
      '@mui/icons-material',
      '@mui/lab',
      '@mui/x-date-pickers',
      '@mui/x-date-pickers/AdapterDayjs',
      'react-redux'
    ],
    exclude: ['@pega/react-sdk-components']
  },
  define: {
    global: 'window'
  }
});
