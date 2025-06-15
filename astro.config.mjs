// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import alpinejs from '@astrojs/alpinejs';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
    envPrefix: 'CC_' // allows Astro to load any env variable starting with CC_
  },
  integrations: [
    alpinejs()
  ]
});
