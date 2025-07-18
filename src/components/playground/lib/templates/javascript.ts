import type { Template } from "../types";

export const javascriptTemplate: Template = {
	id: "javascript",
	name: "JavaScript",
	description: "Simple JavaScript environment with Jest for testing functions",
	icon: "javascript",
	version: 1,
	hasPreview: false,
	defaultFile: "src/index.js",
	files: {
		"package.json": {
			file: {
				contents: JSON.stringify(
					{
						name: "js-fn-test",
						version: "0.0.1",
						private: true,
						type: "module",
						scripts: {
							test: "node --test --test-reporter=junit",
						},
					},
					null,
					2,
				),
			},
		},
		src: {
			directory: {
				"index.js": {
					file: {
						contents: `// Write your functions here
export function add(a, b) {
  return a + b;
}
`,
					},
				},
				__tests__: {
					directory: {
						"index.test.js": {
							file: {
								contents: `/**
 * We are using node:test for writing test cases here
 * use chatgpt / ai to generate effective test cases for your functions
 */
import { add } from '../index.js';
import { test } from 'node:test';
import assert from 'node:assert';

test('adds two numbers correctly', () => {
  assert.strictEqual(add(1, 2), 3);
});
`,
							},
						},
					},
				},
			},
		},
		"jest.config.js": {
			file: {
				contents: `export default {
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json'],
  testMatch: ['**/__tests__/**/*.test.js'],
  verbose: true,
  transform: {}
}`,
			},
		},
	},
};
