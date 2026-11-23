import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'node:child_process';
import path from 'path';
import { defineConfig } from 'vite';

function resolveCommitSha(): string {
  const envSha = process.env.VITE_COMMIT_SHA?.trim();
  if (envSha) return envSha.slice(0, 7);
  try {
    return execSync('git rev-parse --short=7 HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return 'main';
  }
}

export default defineConfig(() => ({
  plugins: [react(), tailwindcss()],
  define: {
    'import.meta.env.VITE_COMMIT_SHA': JSON.stringify(resolveCommitSha()),
  },
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
}));
