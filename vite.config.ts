import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

// Custom Vite plugin to mount Express API routes in the dev server
function apiPlugin() {
  return {
    name: 'api-plugin',
    async configureServer(server: any) {
      const { default: apiRouter } = await import('./api.js');
      const { default: express } = await import('express');

      const app = express();
      app.use('/api', apiRouter);

      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url?.startsWith('/api')) {
          app(req, res, next);
        } else {
          next();
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), apiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
