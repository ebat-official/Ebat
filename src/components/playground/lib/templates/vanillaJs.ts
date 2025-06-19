import type { Template } from "../types";

export const vanillaJsTemplate: Template = {
	id: "vanilla-js",
	name: "Vanilla JS",
	description: "Vanilla JavaScript with Vite and Jest",
	icon: "vanilla",
	installCommand: "npm install",
	startCommand: "npm run dev",
	version: 1,
	hasPreview: true,
	defaultFile: "src/main.js",
	files: {
		"package.json": {
			file: {
				contents: JSON.stringify(
					{
						name: "vanilla-js-app",
						private: true,
						version: "0.0.0",
						type: "module",
						scripts: {
							dev: "vite",
							build: "vite build",
							preview: "vite preview",
							test: "jest",
						},
						devDependencies: {
							"@babel/preset-env": "^7.23.8",
							"@types/jest": "^29.5.11",
							jest: "^29.7.0",
							"jest-environment-jsdom": "^29.7.0",
							vite: "^5.0.8",
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
		src: {
			directory: {
				__tests__: {
					directory: {
						"counter.test.js": {
							file: {
								contents: `/**
 * @jest-environment jsdom
 */
import { setupCounter } from '../counter'

describe('Counter', () => {
  beforeEach(() => {
    document.body.innerHTML = '<button id="counter"></button>'
  })

  it('initializes counter with 0', () => {
    const button = document.getElementById('counter')
    setupCounter(button)
    expect(button.textContent).toBe('Count: 0')
  })

  it('increments counter on button click', () => {
    const button = document.getElementById('counter')
    setupCounter(button)
    
    button.click()
    expect(button.textContent).toBe('Count: 1')
    
    button.click()
    expect(button.textContent).toBe('Count: 2')
  })
})`,
							},
						},
					},
				},
				"counter.js": {
					file: {
						contents: `export function setupCounter(element) {
  let counter = 0
  const setCounter = (count) => {
    counter = count
    element.textContent = \`Count: \${counter}\`
  }
  
  element.className = "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
  setCounter(0)
  
  element.addEventListener('click', () => setCounter(counter + 1))
}`,
					},
				},
				"main.js": {
					file: {
						contents: `import './style.css'
import { setupCounter } from './counter'

document.querySelector('#app').innerHTML = \`
  <div class="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
    <h1 class="text-4xl font-bold">Vanilla JavaScript</h1>
    <button id="counter"></button>
  </div>
\`

setupCounter(document.querySelector('#counter'))`,
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
			},
		},
		"index.html": {
			file: {
				contents: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vanilla JavaScript App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>`,
			},
		},
		"jest.config.js": {
			file: {
				contents: `export default {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.js$': 'babel-jest',
  }
}`,
			},
		},
		"babel.config.js": {
			file: {
				contents: `export default {
  presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
}`,
			},
		},
		"tailwind.config.js": {
			file: {
				contents: `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
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
		"vite.config.js": {
			file: {
				contents: `import { defineConfig } from 'vite'

export default defineConfig({
  // Add any Vite configuration options here
})`,
			},
		},
	},
};
