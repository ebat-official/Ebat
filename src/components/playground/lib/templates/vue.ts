import type { Template } from "../types";

export const vueTemplate: Template = {
	id: "vue",
	name: "Vue.js",
	description: "Modern Vue 3 with TypeScript and Vite",
	icon: "vue",
	installCommand: "npm install",
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
							build: "vue-tsc && vite build",
							preview: "vite preview",
							test: "jest --config jest.config.js --no-cache --verbose",
						},
						dependencies: {
							vue: "^3.3.4",
						},
						devDependencies: {
							"@vitejs/plugin-vue": "^4.2.3",
							"@vue/test-utils": "^2.4.1",
							"@vue/vue3-jest": "^29.2.4",
							"@types/jest": "^29.5.11",
							"@babel/preset-env": "^7.23.8",
							typescript: "^5.2.2",
							vite: "^4.4.5",
							jest: "^29.7.0",
							"jest-environment-jsdom": "^29.7.0",
							"ts-jest": "^29.1.1",
							tailwindcss: "^3.4.0",
							postcss: "^8.4.32",
							autoprefixer: "^10.4.16",
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
    <title>Vue + TypeScript + Vite</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>`,
			},
		},
		src: {
			directory: {
				"App.vue": {
					file: {
						contents: `<script lang="ts">
import { defineComponent, ref } from 'vue'
import './style.css'

export default defineComponent({
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
})
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center gap-4 p-4 bg-gray-900">
    <div>
      <button
        type="button"
        @click="increment"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Count: {{ count }}
      </button>
    </div>
  </div>
</template>`,
					},
				},
				"main.ts": {
					file: {
						contents: `import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')`,
					},
				},
				"style.css": {
					file: {
						contents: `@tailwind base;
@tailwind components;
@tailwind utilities;

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
						"App.test.ts": {
							file: {
								contents: `import { ref } from 'vue'

test('counter increments correctly', () => {
  const count = ref(0)
  expect(count.value).toBe(0)
  
  count.value++
  expect(count.value).toBe(1)
})`,
							},
						},
					},
				},
				"vueShim.d.ts": {
					file: {
						contents:
							"declare module '*.vue' {\n  import { DefineComponent } from 'vue'\n  const component: DefineComponent<{}, {}, any>\n  export default component\n}\n",
					},
				},
			},
		},
		"jest.config.js": {
			file: {
				contents: `export default {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|js)$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'json']
}`,
			},
		},
		"tailwind.config.js": {
			file: {
				contents: `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`,
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
		"vite.config.ts": {
			file: {
				contents: `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom'
  }
})`,
			},
		},
		"env.d.ts": {
			file: {
				contents: `/// <reference types="vite/client" />`,
			},
		},
		"tsconfig.json": {
			file: {
				contents: JSON.stringify(
					{
						compilerOptions: {
							target: "ES2020",
							useDefineForClassFields: true,
							module: "ESNext",
							lib: ["ES2020", "DOM", "DOM.Iterable"],
							skipLibCheck: true,
							moduleResolution: "nodenext",
							allowImportingTsExtensions: true,
							resolveJsonModule: true,
							isolatedModules: true,
							noEmit: true,
							strict: true,
							noUnusedLocals: true,
							noUnusedParameters: true,
							noFallthroughCasesInSwitch: true,
							jsx: "preserve",
						},
						include: [
							"src/**/*.ts",
							"src/**/*.d.ts",
							"src/**/*.tsx",
							"src/**/*.vue",
						],
						references: [{ path: "./tsconfig.node.json" }],
					},
					null,
					2,
				),
			},
		},
		"tsconfig.node.json": {
			file: {
				contents: JSON.stringify(
					{
						compilerOptions: {
							composite: true,
							skipLibCheck: true,
							module: "ESNext",
							moduleResolution: "bundler",
							allowSyntheticDefaultImports: true,
						},
						include: ["vite.config.ts"],
					},
					null,
					2,
				),
			},
		},
		"babel.config.js": {
			file: {
				contents: `
export default {
  presets: [['@babel/preset-env', {targets: {node: 'current'}}]],
};
`,
			},
		},
	},
};
