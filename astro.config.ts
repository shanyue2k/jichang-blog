import { defineConfig } from 'astro/config';
import { SITE } from './src/site.config';

export default defineConfig({
  site: SITE.url,
  trailingSlash: 'always',
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  markdown: {
    shikiConfig: { theme: 'github-light' },
  },
});
