import type { Template } from "../types";

export const reactViteTemplate: Template = {
	id: "react",
	name: "React",
	description: "React 18 with Vite, JSX, and Vitest",
	icon: "react",
	installCommand: "pnpm install",
	startCommand: "pnpm run dev",
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
							test: "vitest run --reporter=json",
						},
						dependencies: {
							react: "^18.3.1",
							"react-dom": "^18.3.1",
						},
						devDependencies: {
							"@testing-library/react": "^16.3.0",
							"@testing-library/jest-dom": "^6.1.0",
							"@vitejs/plugin-react": "^4.6.0",
							vite: "^7.0.0",
							vitest: "^3.2.4",
							jsdom: "^26.1.0",
							tailwindcss: "^4.1.11",
							"@tailwindcss/vite": "^4.1.11",
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
						"App.test.jsx": {
							file: {
								contents: `import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('App', () => {
  it('should display count as 0 initially', () => {
    render(<App />);
    expect(screen.getByRole('button')).toHaveTextContent('Count: 0');
  });

  it('should increment counter on button click', () => {
    render(<App />);
    const button = screen.getByRole('button');
    
    expect(button).toHaveTextContent('Count: 0');
    fireEvent.click(button);
    expect(button).toHaveTextContent('Count: 1');
  });

  it('should increment counter multiple times', () => {
    render(<App />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    fireEvent.click(button);
    expect(button).toHaveTextContent('Count: 2');
  });
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
						contents: `@import "tailwindcss";`,
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
		"vite.config.js": {
			file: {
				contents: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js']
  },
  server: {
    port: 5002,
    host: true
  }
});`,
			},
		},
	},
};
