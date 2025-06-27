import type { Template } from "../types";

export const nextjsTemplate: Template = {
	id: "NEXTJS",
	name: "Next.js",
	description:
		"Next.js 14 with App Router, TypeScript, Tailwind CSS v4, and Vitest",
	icon: "nextjs",
	installCommand: "pnpm install",
	startCommand: "next dev -p 5002",
	version: 1,
	hasPreview: true,
	defaultFile: "src/app/page.tsx",
	files: {
		"package.json": {
			file: {
				contents: JSON.stringify(
					{
						private: true,
						type: "module",
						scripts: {
							dev: "next dev",
							build: "next build",
							start: "next start",
							test: "vitest run --reporter=json",
						},
						dependencies: {
							next: "14.2.30",
							react: "^18.2.0",
							"react-dom": "^18.2.0",
							"server-only": "^0.0.1",
						},
						devDependencies: {
							"@testing-library/react": "^16.3.0",
							"@testing-library/jest-dom": "^6.1.0",
							"@types/node": "20.10.4",
							"@types/react": "18.2.45",
							"@vitejs/plugin-react": "^4.2.1",
							jsdom: "^23.0.1",
							typescript: "5.3.3",
							vitest: "3.2.4",
							tailwindcss: "^4.1.11",
							"@tailwindcss/postcss": "^4.1.11",
							postcss: "^8.4.35",
						},
					},
					null,
					2,
				),
			},
		},
		src: {
			directory: {
				app: {
					directory: {
						__tests__: {
							directory: {
								"page.test.tsx": {
									file: {
										contents: `import { expect, test } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Page from '../page';

test('Page displays count as 0 initially', () => {
  render(<Page />);
  expect(screen.getByRole('button')).toHaveTextContent('Count: 0');
});

test('Page increments counter on button click', () => {
  render(<Page />);
  const button = screen.getByRole('button');
  
  expect(button).toHaveTextContent('Count: 0');
  fireEvent.click(button);
  expect(button).toHaveTextContent('Count: 1');
});

test('Page increments counter multiple times', () => {
  render(<Page />);
  const button = screen.getByRole('button');
  
  fireEvent.click(button);
  fireEvent.click(button);
  expect(button).toHaveTextContent('Count: 2');
});`,
									},
								},
								"setup.ts": {
									file: {
										contents: `import '@testing-library/jest-dom/vitest';`,
									},
								},
							},
						},
						"globals.css": {
							file: {
								contents: `@import "tailwindcss";`,
							},
						},
						"layout.tsx": {
							file: {
								contents: `import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`,
							},
						},
						"page.tsx": {
							file: {
								contents: `'use client';
import { useState } from 'react';

export default function Page() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-blue-500">
      <button
        onClick={() => setCount(count + 1)}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Count: {count}
      </button>
    </div>
  );
}`,
							},
						},
					},
				},
			},
		},
		"next.config.js": {
			file: {
				contents: `/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;`,
			},
		},
		"postcss.config.js": {
			file: {
				contents: `export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};`,
			},
		},
		"tsconfig.json": {
			file: {
				contents: JSON.stringify(
					{
						compilerOptions: {
							target: "es5",
							lib: ["dom", "dom.iterable", "esnext"],
							allowJs: true,
							skipLibCheck: true,
							strict: true,
							forceConsistentCasingInFileNames: true,
							noEmit: true,
							esModuleInterop: true,
							module: "esnext",
							moduleResolution: "bundler",
							resolveJsonModule: true,
							isolatedModules: true,
							jsx: "preserve",
							incremental: true,
							plugins: [
								{
									name: "next",
								},
							],
						},
						include: [
							"next-env.d.ts",
							"**/*.ts",
							"**/*.tsx",
							".next/types/**/*.ts",
						],
						exclude: ["node_modules"],
					},
					null,
					2,
				),
			},
		},
		"vitest.config.ts": {
			file: {
				contents: `import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/app/__tests__/setup.ts"],
  },
});`,
			},
		},
	},
};
