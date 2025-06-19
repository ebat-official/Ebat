import type { Template } from "../types";

export const reactViteTemplate: Template = {
	id: "react-vite",
	name: "React",
	description: "React with Vite, TypeScript, and Jest",
	icon: "react",
	installCommand: "npm install",
	startCommand: "npm run dev",
	version: 1,
	hasPreview: true,
	defaultFile: "src/App.tsx",
	files: {
		"package.json": {
			file: {
				contents: JSON.stringify(
					{
						name: "react-app",
						private: true,
						version: "0.0.0",
						type: "module",
						scripts: {
							dev: "vite",
							build: "tsc && vite build",
							lint: "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
							preview: "vite preview",
							test: "jest --config jest.config.js --no-cache --verbose",
						},
						dependencies: {
							react: "^18.2.0",
							"react-dom": "^18.2.0",
						},
						devDependencies: {
							"@testing-library/react": "^14.1.2",
							"@testing-library/jest-dom": "^6.1.5",
							"@types/react": "^18.2.43",
							"@types/react-dom": "^18.2.17",
							"@types/jest": "^29.5.11",
							"@vitejs/plugin-react": "^4.2.1",
							typescript: "^5.2.2",
							vite: "^5.0.8",
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
		src: {
			directory: {
				__tests__: {
					directory: {
						"index.test.tsx": {
							file: {
								contents: `import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import App from '../App'

test('increments counter on button click', () => {
  render(<App />)
  const button = screen.getByRole('button')
  
  expect(button).toHaveTextContent('Count: 0')
  fireEvent.click(button)
  expect(button).toHaveTextContent('Count: 1')
})`,
							},
						},
					},
				},
				"App.tsx": {
					file: {
						contents: `import { useState } from 'react'

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen flex items-center justify-center">
      <button
        onClick={() => setCount(count + 1)}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Count: {count}
      </button>
    </div>
  )
}`,
					},
				},
				"main.tsx": {
					file: {
						contents: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
					},
				},
				"index.css": {
					file: {
						contents: `@tailwind base;
@tailwind components;
@tailwind utilities;`,
					},
				},
				"setupTests.ts": {
					file: {
						contents: `import '@testing-library/jest-dom'`,
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
    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
			},
		},
		"jest.config.js": {
			file: {
				contents: `/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts']
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
		"vite.config.ts": {
			file: {
				contents: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`,
			},
		},
		"tsconfig.json": {
			file: {
				contents: JSON.stringify(
					{
						compilerOptions: {
							target: "ES2020",
							useDefineForClassFields: true,
							lib: ["ES2020", "DOM", "DOM.Iterable"],
							module: "ESNext",
							skipLibCheck: true,
							moduleResolution: "bundler",
							allowImportingTsExtensions: true,
							resolveJsonModule: true,
							isolatedModules: true,
							noEmit: true,
							jsx: "react-jsx",
							strict: true,
							noUnusedLocals: true,
							noUnusedParameters: true,
							noFallthroughCasesInSwitch: true,
							types: ["jest", "@testing-library/jest-dom"],
						},
						include: ["src"],
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
	},
};
