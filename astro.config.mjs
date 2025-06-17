import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import alpinejs from '@astrojs/alpinejs';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  integrations: [alpinejs()],
  vite: {
    plugins: [tailwindcss()],
    envPrefix: ['CC_', 'AZURE_OPENAI_'],
    build: {
      rollupOptions: {
        external: ['openai'] // 👈 prevent bundling
      }
    }
  }
});
