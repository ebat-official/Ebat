import type { Template } from "../types";

export const sveltekitTemplate: Template = {
	id: "SVELTEKIT",
	name: "SvelteKit",
	description: "Modern SvelteKit with TypeScript and Vitest",
	icon: "svelte",
	installCommand: "npm install",
	startCommand: "npm run dev",
	version: 1,
	hasPreview: true,
	defaultFile: "src/routes/+page.svelte",
	files: {
		"package.json": {
			file: {
				contents: JSON.stringify(
					{
						name: "sveltekit-app",
						version: "0.0.0",
						private: true,
						scripts: {
							dev: "vite dev",
							build: "vite build",
							preview: "vite preview",
							check:
								"svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
							"check:watch":
								"svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
							test: "vitest run --reporter=verbose",
						},
						devDependencies: {
							"@sveltejs/adapter-auto": "^3.0.0",
							"@sveltejs/kit": "^2.0.0",
							"@sveltejs/vite-plugin-svelte": "^4.0.0-next.6",
							"@testing-library/svelte": "^5.0.0",
							"@testing-library/jest-dom": "^6.4.2",
							jsdom: "^24.0.0",
							svelte: "^5.0.0-next.1",
							"svelte-check": "^3.6.0",
							tslib: "^2.4.1",
							typescript: "^5.0.0",
							vite: "^5.0.3",
							vitest: "^1.2.0",
							tailwindcss: "^3.4.0",
							postcss: "^8.4.32",
							autoprefixer: "^10.4.16",
						},
						type: "module",
					},
					null,
					2,
				),
			},
		},
		"postcss.config.js": {
			file: {
				contents: `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,
			},
		},
		"tailwind.config.js": {
			file: {
				contents: `/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
  },
  plugins: [],
}`,
			},
		},
		"svelte.config.js": {
			file: {
				contents: `import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter()
  },
  preprocess: [
    vitePreprocess({
      postcss: true
    })
  ]
};

export default config;`,
			},
		},
		"vite.config.ts": {
			file: {
				contents: `import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  plugins: [sveltekit()],
  resolve: {
    conditions: mode === 'test' ? ['browser'] : [],
  },
  server: {
    port: 5175,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,ts}'],
    setupFiles: ['./src/test/setup.ts'],
    environmentOptions: {
      jsdom: {
        resources: 'usable',
        pretendToBeVisual: true
      }
    },
    deps: {
      optimizer: {
        web: {
          include: ['@sveltejs/kit', 'svelte']
        }
      }
    },
    port: 51004,
  }
}));`,
			},
		},
		"tsconfig.json": {
			file: {
				contents: JSON.stringify(
					{
						extends: "./.svelte-kit/tsconfig.json",
						compilerOptions: {
							allowJs: true,
							checkJs: true,
							esModuleInterop: true,
							forceConsistentCasingInFileNames: true,
							resolveJsonModule: true,
							skipLibCheck: true,
							sourceMap: true,
							strict: true,
							types: ["vitest/globals"],
							moduleResolution: "nodenext",
						},
					},
					null,
					2,
				),
			},
		},
		src: {
			directory: {
				routes: {
					directory: {
						"+page.svelte": {
							file: {
								contents: `<script lang="ts">
  let count = 0;
  function increment() {
    count++;
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-900">
  <button
    on:click={increment}
    class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
  >
    Count: {count}
  </button>
</div>

<style>
  :global(body) {
    margin: 0;
  }
</style>`,
							},
						},
						"+layout.svelte": {
							file: {
								contents: `<script>
  import '../app.css';
</script>

<slot />`,
							},
						},
					},
				},
				"app.css": {
					file: {
						contents: `@tailwind base;
@tailwind components;
@tailwind utilities;`,
					},
				},
				"app.html": {
					file: {
						contents: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>SvelteKit App</title>
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>`,
					},
				},
				"app.d.ts": {
					file: {
						contents: `// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface Platform {}
  }
}

export {};`,
					},
				},
				"hooks.server.ts": {
					file: {
						contents: `import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  return await resolve(event);
};`,
					},
				},
				__tests__: {
					directory: {
						"counter.test.ts": {
							file: {
								contents: `import { render, fireEvent } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import Counter from '../routes/+page.svelte';

describe('Counter', () => {
  it('increments counter on button click', async () => {
    const { getByRole } = render(Counter, {
      target: document.createElement('div'),
      props: {}
    });
    
    const button = getByRole('button');
    expect(button).toHaveTextContent('Count: 0');
    
    await fireEvent.click(button);
    expect(button).toHaveTextContent('Count: 1');
  });
});`,
							},
						},
					},
				},
				test: {
					directory: {
						"setup.ts": {
							file: {
								contents: `import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));`,
							},
						},
					},
				},
			},
		},
	},
};
