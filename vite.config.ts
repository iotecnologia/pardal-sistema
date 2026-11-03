/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' para o build abrir de qualquer pasta (ex.: GitHub Pages)
export default defineConfig({
  plugins: [react()],
  base: './',
  build: { chunkSizeWarningLimit: 900 }, // o gerador de PDF fica num pedaço separado, carregado só quando usado
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
});
