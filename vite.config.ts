import { defineConfig, type PluginOption, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(async ({ command }): Promise<UserConfig> => {
  const plugins: PluginOption[] = [react(), tailwindcss()];

  // The element-picker source tagger is a dev-only affordance; keep it out of
  // production HTML so every element does not carry a data-source-loc attribute.
  if (command === 'serve') {
    try {
      // @ts-expect-error optional untyped dev-only plugin
      const m = await import('./.vite-source-tags.js');
      plugins.push(m.sourceTags());
    } catch {
      /* optional dev plugin not present */
    }
  }

  return {
    plugins,
    server: {
      host: '0.0.0.0',
      allowedHosts: true
    },
    preview: {
      host: '0.0.0.0',
      allowedHosts: true
    },
    build: {
      target: 'es2020',
      cssCodeSplit: true,
      sourcemap: false,
      modulePreload: { polyfill: false },
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules')) {
              if (id.includes('react-router')) return 'router';
              if (id.includes('lucide-react')) return 'icons';
              if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/scheduler/')) return 'react';
            }
            if (id.includes('/src/data/collections/')) {
              const name = id.split('/').pop()!.replace(/\.json$/, '');
              return `data-${name}`;
            }
          }
        }
      }
    },
    ssr: {
      noExternal: ['lucide-react']
    }
  };
});
