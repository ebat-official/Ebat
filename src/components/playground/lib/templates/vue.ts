import type { Template } from "../types";

export const vueTemplate: Template = {
	id: "vue",
	name: "Vue.js",
	description: "Vue 3 with JavaScript, Vite, and Toggle Component",
	icon: "vue",
	installCommand: "pnpm install",
	startCommand: "npm run dev",
	version: 1,
	hasPreview: true,
	defaultFile: "src/App.vue",
	files: {
		"package.json": {
			file: {
				contents: JSON.stringify(
					{
						name: "vue-app",
						private: true,
						version: "0.0.0",
						type: "module",
						scripts: {
							dev: "vite",
							build: "vite build",
							preview: "vite preview",
							test: "vitest run --reporter=json",
						},

						dependencies: {
							vue: "^3.5.17",
						},
						devDependencies: {
							"@vitejs/plugin-vue": "^6.0.0",
							"@vue/test-utils": "^2.4.6",
							"@testing-library/vue": "^8.1.0",
							vitest: "^3.2.4",
							jsdom: "^26.1.0",
							vite: "^7.0.0",
							tailwindcss: "^4.1.11",
							"@tailwindcss/vite": "^4.1.11",
						},
					},
					null,
					2,
				),
			},
		},
		"index.html": {
			file: {
				contents: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vue + JavaScript + Vite</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>`,
			},
		},
		src: {
			directory: {
				"App.vue": {
					file: {
						contents: `<script>
import { ref } from 'vue'
import './style.css'

export default {
  name: 'App',
  setup() {
    const count = ref(0)

    function increment() {
      count.value++
    }

    return {
      count,
      increment,
    }
  },
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-900 text-blue-500">
    <button
      @click="increment"
      class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Count: {{ count }}
    </button>
  </div>
</template>`,
					},
				},
				"main.js": {
					file: {
						contents: `import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')`,
					},
				},
				"style.css": {
					file: {
						contents: `@import "tailwindcss";

:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  color: #213547;
  background-color: #ffffff;
}`,
					},
				},
				__tests__: {
					directory: {
						"App.test.js": {
							file: {
								contents: `import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import App from '../App.vue';

describe('App.vue', () => {
  it('should display count as 0 initially', () => {
    const wrapper = mount(App);
    expect(wrapper.text()).toContain('Count: 0');
  });

  it('should increment counter on button click', async () => {
    const wrapper = mount(App);
    const button = wrapper.get('button');

    await button.trigger('click');
    expect(wrapper.text()).toContain('Count: 1');
  });

  it('should increment counter multiple times', async () => {
    const wrapper = mount(App);
    const button = wrapper.get('button');

    await button.trigger('click');
    await button.trigger('click');
    expect(wrapper.text()).toContain('Count: 2');
  });
});`,
							},
						},
					},
				},
			},
		},
		"vite.config.js": {
			file: {
				contents: `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom'
  },
  server: {
    port: 5001,
    host: true,
    open: false
  },
  optimizeDeps: {
    noDiscovery: true,
    include: []
  },
  build: {
    target: 'esnext'
  }
})`,
			},
		},
	},
};
