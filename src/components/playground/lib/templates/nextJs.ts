import type { Template } from "../types";

export const nextjsTemplate: Template = {
	id: "nextjs",
	name: "Next.js",
	description: "Next.js with TypeScript and Jest",
	icon: "nextjs",
	installCommand: "npm install",
	startCommand: "npm run dev",
	version: 1,
	hasPreview: true,
	defaultFile: "src/app/page.tsx",
	files: {
		"package.json": {
			file: {
				contents: JSON.stringify(
					{
						name: "nextjs-app",
						private: true,
						version: "0.0.0",
						scripts: {
							dev: "next dev",
							build: "next build",
							start: "next start",
							test: "jest",
						},
						dependencies: {
							next: "^14.0.4",
							react: "^18.2.0",
							"react-dom": "^18.2.0",
						},
						devDependencies: {
							"@testing-library/react": "^14.1.2",
							"@testing-library/jest-dom": "^6.1.5",
							"@types/react": "^18.2.43",
							"@types/react-dom": "^18.2.17",
							"@types/jest": "^29.5.11",
							"@types/node": "^20.10.6",
							typescript: "^5.2.2",
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
				app: {
					directory: {
						"page.tsx": {
							file: {
								contents: `'use client'
import React, { useState } from "react"

export default function Page() {
  const [count, setCount] = useState(0)

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-4 bg-gray-900">
      <button
        onClick={() => setCount(count + 1)}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Count: {count}
      </button>
    </main>
  )
}`,
							},
						},
						"layout.tsx": {
							file: {
								contents: `import './globals.css'

export const metadata = {
  title: 'Next.js App',
  description: 'Created with Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}`,
							},
						},
						"globals.css": {
							file: {
								contents: `@tailwind base;
@tailwind components;
@tailwind utilities;`,
							},
						},
					},
				},
				__tests__: {
					directory: {
						"page.test.tsx": {
							file: {
								contents: `import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Page from '../app/page'

describe('Page', () => {
  it('renders heading', () => {
    render(<Page />)
    expect(screen.getByRole('heading')).toHaveTextContent('Next.js App')
  })

  it('increments counter on button click', () => {
    render(<Page />)
    const button = screen.getByRole('button')
    
    expect(button).toHaveTextContent('Count: 0')
    fireEvent.click(button)
    expect(button).toHaveTextContent('Count: 1')
  })
})`,
							},
						},
					},
				},
			},
		},
		"jest.config.js": {
			file: {
				contents: `const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
}

module.exports = createJestConfig(config)`,
			},
		},
		"jest.setup.js": {
			file: {
				contents: `import '@testing-library/jest-dom'`,
			},
		},
		"tailwind.config.ts": {
			file: {
				contents: `import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
export default config`,
			},
		},
		"postcss.config.js": {
			file: {
				contents: `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,
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
							noEmit: true,
							esModuleInterop: true,
							module: "esnext",
							moduleResolution: "nodenext",
							resolveJsonModule: true,
							isolatedModules: true,
							jsx: "preserve",
							incremental: true,
							plugins: [
								{
									name: "next",
								},
							],
							paths: {
								"@/*": ["./src/*"],
							},
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
		"next.config.js": {
			file: {
				contents: `/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = nextConfig`,
			},
		},
	},
};
