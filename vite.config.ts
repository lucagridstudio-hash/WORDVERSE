import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * The preview hostname is supplied per process (VITE_ALLOWED_HOST) so no
 * environment-specific host is committed to the repository.
 */
const allowedHost = process.env.VITE_ALLOWED_HOST;

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: allowedHost ? [allowedHost] : undefined,
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
  },
  build: {
    target: 'es2019',
  },
});
