import type { Template } from "../types";

export const reactViteTemplate: Template = {
	id: "REACT",
	name: "React",
	description: "React with Vite, JSX, and Jest",
	icon: "react",
	installCommand: "npm install",
	startCommand: "npm run dev",
	version: 1,
	hasPreview: true,
	defaultFile: "src/App.jsx",
	files: {
		"package.json": {
			file: {
				contents: JSON.stringify(
					{
						name: "react-jsx-app",
						private: true,
						version: "0.0.0",
						type: "module",
						scripts: {
							dev: "vite",
							build: "vite build",
							lint: "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
							preview: "vite preview",
							test: "jest --no-cache --verbose",
						},
						dependencies: {
							react: "^18.2.0",
							"react-dom": "^18.2.0",
						},
						devDependencies: {
							"@testing-library/react": "^14.1.2",
							"@testing-library/jest-dom": "^6.1.5",
							"@vitejs/plugin-react": "^4.2.1",
							"babel-jest": "^29.7.0",
							"@babel/preset-env": "^7.23.8",
							"@babel/preset-react": "^7.23.3",
							vite: "^5.0.8",
							jest: "^29.7.0",
							"jest-environment-jsdom": "^29.7.0",
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
						"index.test.jsx": {
							file: {
								contents: `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

test('increments counter on button click', () => {
  render(<App />);
  const button = screen.getByRole('button');
  
  expect(button).toHaveTextContent('Count: 0');
  fireEvent.click(button);
  expect(button).toHaveTextContent('Count: 1');
});`,
							},
						},
					},
				},
				"App.jsx": {
					file: {
						contents: `import React, { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-blue-500">
      <button
        onClick={() => setCount(count + 1)}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Count: {count}
      </button>
    </div>
  );
}`,
					},
				},
				"main.jsx": {
					file: {
						contents: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
					},
				},
				"index.css": {
					file: {
						contents: `@tailwind base;
@tailwind components;
@tailwind utilities;`,
					},
				},
				"setupTests.js": {
					file: {
						contents: `import '@testing-library/jest-dom';`,
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
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
			},
		},
		"jest.config.js": {
			file: {
				contents: `/** @type {import('jest').Config} */
export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
};`,
			},
		},
		"babel.config.js": {
			file: {
				contents: `export default {
  presets: [
    '@babel/preset-env',
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
};`,
			},
		},
		"jsconfig.json": {
			file: {
				contents: JSON.stringify(
					{
						compilerOptions: {
							jsx: "react-jsx",
						},
						include: ["src"],
					},
					null,
					2,
				),
			},
		},
		"tailwind.config.js": {
			file: {
				contents: `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};`,
			},
		},
		"postcss.config.js": {
			file: {
				contents: `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`,
			},
		},
		"vite.config.js": {
			file: {
				contents: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});`,
			},
		},
	},
};
