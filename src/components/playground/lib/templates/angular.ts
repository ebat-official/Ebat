import type { Template } from "../types";

export const angularTemplate: Template = {
	id: "ANGULAR",
	name: "Angular",
	description: "Modern Angular 17 with TypeScript and Jest",
	icon: "angular",
	installCommand: "npm install",
	startCommand: "ng serve",
	version: 1,
	hasPreview: true,
	defaultFile: "src/app/app.component.ts",
	files: {
		"package.json": {
			file: {
				contents: JSON.stringify(
					{
						name: "angular-app",
						version: "0.0.0",
						scripts: {
							start: "ng serve",
							test: "jest --json",
						},
						dependencies: {
							"@angular/animations": "^17.0.0",
							"@angular/common": "^17.0.0",
							"@angular/compiler": "^17.0.0",
							"@angular/core": "^17.0.0",
							"@angular/forms": "^17.0.0",
							"@angular/platform-browser": "^17.0.0",
							"@angular/platform-browser-dynamic": "^17.0.0",
							"@angular/router": "^17.0.0",
							rxjs: "~7.8.0",
							tslib: "^2.3.0",
							"zone.js": "~0.14.2",
						},
						devDependencies: {
							"@angular-devkit/build-angular": "^17.0.0",
							"@angular/cli": "^17.0.0",
							"@angular/compiler-cli": "^17.0.0",
							"@types/jest": "^29.5.11",
							"@types/node": "^20.10.0",
							jest: "^29.7.0",
							"jest-preset-angular": "^13.1.4",
							"ts-jest": "^29.1.1",
							typescript: "~5.2.2",
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
		"angular.json": {
			file: {
				contents: JSON.stringify(
					{
						$schema: "./node_modules/@angular/cli/lib/config/schema.json",
						version: 1,
						newProjectRoot: "projects",
						projects: {
							"angular-app": {
								projectType: "application",
								schematics: {
									"@schematics/angular:component": {
										style: "css",
									},
								},
								root: "",
								sourceRoot: "src",
								prefix: "app",
								architect: {
									build: {
										builder: "@angular-devkit/build-angular:browser",
										options: {
											outputPath: "dist/angular-app",
											index: "src/index.html",
											main: "src/main.ts",
											polyfills: ["zone.js"],
											tsConfig: "tsconfig.app.json",
											assets: ["src/favicon.ico", "src/assets"],
											styles: ["src/styles.css"],
											scripts: [],
										},
										configurations: {
											production: {
												budgets: [
													{
														type: "initial",
														maximumWarning: "500kb",
														maximumError: "1mb",
													},
													{
														type: "anyComponentStyle",
														maximumWarning: "2kb",
														maximumError: "4kb",
													},
												],
												outputHashing: "all",
											},
											development: {
												buildOptimizer: false,
												optimization: false,
												vendorChunk: true,
												extractLicenses: false,
												sourceMap: true,
												namedChunks: true,
											},
										},
										defaultConfiguration: "production",
									},
									serve: {
										builder: "@angular-devkit/build-angular:dev-server",
										configurations: {
											production: {
												browserTarget: "angular-app:build:production",
											},
											development: {
												browserTarget: "angular-app:build:development",
											},
										},
										defaultConfiguration: "development",
									},
								},
							},
						},
					},
					null,
					2,
				),
			},
		},
		"tsconfig.json": {
			file: {
				contents: JSON.stringify(
					{
						compileOnSave: false,
						compilerOptions: {
							baseUrl: "./",
							outDir: "./dist/out-tsc",
							forceConsistentCasingInFileNames: true,
							strict: true,
							noImplicitOverride: true,
							noPropertyAccessFromIndexSignature: true,
							noImplicitReturns: true,
							noFallthroughCasesInSwitch: true,
							sourceMap: true,
							declaration: false,
							downlevelIteration: true,
							experimentalDecorators: true,
							moduleResolution: "node",
							importHelpers: true,
							target: "ES2022",
							module: "ES2022",
							useDefineForClassFields: false,
							lib: ["ES2022", "dom"],
						},
						angularCompilerOptions: {
							enableI18nLegacyMessageIdFormat: false,
							strictInjectionParameters: true,
							strictInputAccessModifiers: true,
							strictTemplates: true,
						},
					},
					null,
					2,
				),
			},
		},
		"tsconfig.app.json": {
			file: {
				contents: JSON.stringify(
					{
						extends: "./tsconfig.json",
						compilerOptions: {
							outDir: "./out-tsc/app",
							types: [],
						},
						files: ["src/main.ts"],
						include: ["src/**/*.d.ts"],
					},
					null,
					2,
				),
			},
		},
		src: {
			directory: {
				"setup-jest.ts": {
					file: {
						contents: `import 'jest-preset-angular/setup-jest';`,
					},
				},
				app: {
					directory: {
						"app.component.ts": {
							file: {
								contents: `import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: \`
    <div class="min-h-screen flex items-center justify-center bg-gray-900">
      <button
        (click)="increment()"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Count: {{ count }}
      </button>
    </div>
  \`,
  styles: []
})
export class AppComponent {
  count = 0;

  increment() {
    this.count++;
  }
}`,
							},
						},
						"app.module.ts": {
							file: {
								contents: `import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  bootstrap: [AppComponent]
})
export class AppModule { }`,
							},
						},
					},
				},
				"main.ts": {
					file: {
						contents: `import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));`,
					},
				},
				"styles.css": {
					file: {
						contents: `@tailwind base;
@tailwind components;
@tailwind utilities;`,
					},
				},
				"index.html": {
					file: {
						contents: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Angular App</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <app-root></app-root>
</body>
</html>`,
					},
				},
				__tests__: {
					directory: {
						"app.component.spec.ts": {
							file: {
								contents: `import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from '../app/app.component';

describe('AppComponent', () => {
  let component: AppComponent;

  beforeEach(() => {
    component = new AppComponent();
  });

  it('should increment counter', () => {
    expect(component.count).toBe(0);
    component.increment();
    expect(component.count).toBe(1);
  });
});`,
							},
						},
					},
				},
			},
		},
		"jest.config.js": {
			file: {
				contents: `module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['./src/setup-jest.ts'],
  globalSetup: 'jest-preset-angular/global-setup',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'js', 'html'],
  transform: {
    '^.+\\.(ts|js|html)$': ['jest-preset-angular', {
      tsconfig: './tsconfig.json',
      stringifyContentPathRegex: '\\.html$'
    }]
  }
};`,
			},
		},
		"tailwind.config.js": {
			file: {
				contents: `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
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
				contents: `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,
			},
		},
	},
};
