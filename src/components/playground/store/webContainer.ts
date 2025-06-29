import { PostWithExtraDetails } from "@/utils/types";
import { WebContainer } from "@webcontainer/api";
import type { FileSystemTree } from "@webcontainer/api";
import { toast } from "sonner";
import { create } from "zustand";
import type { Template } from "../lib/types";
import { getLanguageFromPath } from "../lib/utils";
import type { VitestJsonResult } from "../types/test";
import { isJSON } from "@/utils/isJSON";
import { junitParser } from "../utils/junitParser";
import type { TestExecutionResult } from "../types/test";
import { TemplateStorage } from "../utils/templateStorage";

interface OpenFile {
	path: string;
	name: string;
	content: string;
	language: string;
	isDirty: boolean;
}

interface WebContainerState {
	webContainer: WebContainer | null;
	isContainerReady: boolean;
	isTemplateReady: boolean;
	isInitializing: boolean;
	previewUrl: string;
	terminalOutput: string[];
	selectedTemplate: Template | null;
	isLoading: boolean;
	serverProcess: { kill: () => void; exit: Promise<number> } | null;
	files: FileSystemTree | null;
	openFiles: OpenFile[];
	activeFile: string | null;
	post: PostWithExtraDetails | null;
	isLanguageDropdownDisabled: boolean;
	// Test state
	testResults: {
		numTotalTests: number;
		numPassedTests: number;
		numFailedTests: number;
		allTestsPassed: boolean;
	} | null;
	isRunningTests: boolean;
	addTerminalOutput: (output: string) => void;
	clearTerminalOutput: () => void;
	runCommand: (
		command: string,
		args?: string[],
	) => Promise<{ kill: () => void; exit: Promise<number> } | null>;
	initializeContainer: () => Promise<void>;
	selectTemplate: (template: Template) => Promise<Template | null>;
	stopServer: () => Promise<void>;
	restartServer: () => Promise<void>;
	handleFileOperation: (
		operation: "create" | "delete" | "rename",
		path: string,
		newPath?: string,
		content?: string,
	) => Promise<void>;
	getFileTree: (path: string) => Promise<FileSystemTree>;
	setFiles: (files: FileSystemTree) => void;
	handleFileSelect: (path: string) => Promise<void>;
	handleFileContentChange: (content: string) => Promise<void>;
	handleCloseFile: (path: string) => void;
	clearOpenFiles: () => void;
	resetToOriginalTemplate: () => Promise<void>;
	setLanguageDropdownDisabled: (disabled: boolean) => void;
	cleanupContainer: () => Promise<void>;
	setPost: (post: PostWithExtraDetails) => void;
	// Test functions
	executeTests: () => Promise<TestExecutionResult>;
	runTestsForValidation: () => Promise<{
		success: boolean;
		hasTests: boolean;
		message: string;
	}>;
	clearTestResults: () => void;
}

// Maximum number of lines to keep in terminal
const MAX_TERMINAL_LINES = 30;

// Filter out ANSI escape sequences and empty lines
function cleanTerminalOutput(output: string): string | null {
	// Remove ANSI escape sequences
	const cleaned = output
		// biome-ignore lint/suspicious/noControlCharactersInRegex: Legitimate use for terminal output cleaning
		.replace(/\u001b\[[0-9;]*[a-zA-Z]/g, "") // Remove ANSI escape sequences
		.replace(/\[[\d;]*[a-zA-Z]/g, "") // Remove terminal control sequences
		// biome-ignore lint/suspicious/noControlCharactersInRegex: Legitimate use for terminal output cleaning
		.replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remove control characters
		.trim();

	// Return null for empty lines
	return cleaned === "" ? null : cleaned;
}

export const useWebContainerStore = create<WebContainerState>()((set, get) => ({
	webContainer: null,
	isContainerReady: false,
	isTemplateReady: false,
	isInitializing: false,
	previewUrl: "",
	terminalOutput: [],
	selectedTemplate: null,
	isLoading: false,
	serverProcess: null,
	files: null,
	openFiles: [],
	activeFile: null,
	post: null,
	isLanguageDropdownDisabled: false,
	// Test state
	testResults: null,
	isRunningTests: false,

	addTerminalOutput: (output: string) => {
		const cleaned = cleanTerminalOutput(output);
		if (cleaned === null) return; // Skip empty or control-only lines

		set((state) => {
			const newOutput = [
				...state.terminalOutput,
				`${new Date().toLocaleTimeString()} ${cleaned}`,
			];

			// Keep only the last MAX_TERMINAL_LINES lines
			if (newOutput.length > MAX_TERMINAL_LINES) {
				return { terminalOutput: newOutput.slice(-MAX_TERMINAL_LINES) };
			}

			return { terminalOutput: newOutput };
		});
	},

	clearTerminalOutput: () => {
		set({ terminalOutput: [] });
	},

	runCommand: async (command: string, args: string[] = []) => {
		const { webContainer, addTerminalOutput } = get();
		if (!webContainer) return null;

		try {
			const process = await webContainer.spawn(command, args);
			process.output.pipeTo(
				new WritableStream({
					write(data) {
						addTerminalOutput(data);
					},
				}),
			);
			return process;
		} catch (error) {
			console.error(`Failed to run command ${command}:`, error);
			addTerminalOutput(`❌ Failed to run command ${command}`);
			return null;
		}
	},

	initializeContainer: async () => {
		const { addTerminalOutput, isContainerReady, isInitializing } = get();
		if (isContainerReady || isInitializing) {
			return;
		}
		try {
			set({ isInitializing: true });
			addTerminalOutput("🚀 Initializing Environment...");
			const container = await WebContainer.boot();

			set({
				webContainer: container,
				isContainerReady: true,
				isInitializing: false,
			});
			addTerminalOutput("✅ Environment is ready!");

			container.on("server-ready", (port, url) => {
				set({ previewUrl: url });
				addTerminalOutput(`🌐 Server ready at ${url}`);
			});
		} catch (error) {
			console.error("Failed to initialize Environment:", error);
			addTerminalOutput("❌ Failed to initialize Environment");
			set({ isInitializing: false });
			toast.error("Failed to initialize Environment");
		}
	},

	stopServer: async () => {
		const { serverProcess, addTerminalOutput } = get();
		if (!serverProcess) return;

		try {
			// Kill the process
			serverProcess.kill();
			// Wait for the process to exit
			await serverProcess.exit;
			set({ serverProcess: null, previewUrl: "" });
			addTerminalOutput(" Server stopped");
		} catch (error) {
			console.error("Failed to stop server:", error);
			addTerminalOutput("❌ Failed to stop server");
			// Even if there's an error, clear the server process
			set({ serverProcess: null, previewUrl: "" });
		}
	},

	cleanupContainer: async () => {
		const { webContainer, addTerminalOutput, stopServer } = get();
		if (!webContainer) return;
		await stopServer();
		try {
			// Read all files and directories in the root
			const entries = await webContainer.fs.readdir(".", {
				withFileTypes: true,
			});

			// Remove all files and directories
			for (const entry of entries) {
				try {
					if (entry.isDirectory()) {
						await webContainer.fs.rm(entry.name, { recursive: true });
					} else {
						await webContainer.fs.rm(entry.name);
					}
				} catch (error) {
					// Some files might not exist or be locked, which is fine
					console.warn(`Could not remove ${entry.name}:`, error);
				}
			}
			const entries2 = await webContainer.fs.readdir(".", {
				withFileTypes: true,
			});

			addTerminalOutput("🗑️ Cleaned up all files in container");
		} catch (error) {
			console.error("Failed to cleanup container:", error);
			addTerminalOutput("❌ Failed to cleanup container");
		}
	},

	restartServer: async () => {
		const { stopServer, selectedTemplate, addTerminalOutput } = get();
		if (!selectedTemplate) return;

		try {
			// Stop the current server
			await stopServer();
			addTerminalOutput("🔄 Restarting server...");

			// Start the server again
			if (selectedTemplate.startCommand) {
				const [command, ...args] = selectedTemplate.startCommand.split(" ");
				const process = await get().runCommand(command, args);
				if (process) {
					set({ serverProcess: process });
				}
			}
		} catch (error) {
			console.error("Failed to restart server:", error);
			addTerminalOutput("❌ Failed to restart server");
			toast.error("Failed to restart server");
		}
	},

	selectTemplate: async (template: Template) => {
		const {
			webContainer,
			addTerminalOutput,
			runCommand,
			setFiles,
			clearOpenFiles,
			handleFileSelect,
			stopServer,
			cleanupContainer,
			selectedTemplate,
		} = get();

		// Check if we're switching to a different template
		const isDifferentTemplate =
			selectedTemplate && selectedTemplate.id !== template.id;

		// If switching to a different template, allow it even if loading
		// If it's the same template and loading, don't allow
		if (get().isLoading && !isDifferentTemplate) return null;

		set({
			isLoading: true,
			selectedTemplate: template,
			isTemplateReady: false,
		});

		// Use template files (could be original or merged with saved changes)
		const filesToMount = template.files as FileSystemTree;

		setFiles(filesToMount);
		clearOpenFiles();

		try {
			let currentContainer = webContainer;

			// If container is null, boot fresh container
			if (!currentContainer) {
				addTerminalOutput(`🚀 Booting container for ${template.name}...`);
				currentContainer = await WebContainer.boot();

				set({
					webContainer: currentContainer,
					isContainerReady: true,
				});

				currentContainer.on("server-ready", (port, url) => {
					set({ previewUrl: url });
					addTerminalOutput(`🌐 Server ready at ${url}`);
				});

				addTerminalOutput("✅ Container ready");
			} else if (isDifferentTemplate) {
				// If switching templates, stop server and cleanup
				addTerminalOutput(`🔄 Switching to ${template.name} template...`);
				await stopServer();
				await cleanupContainer();
			}

			addTerminalOutput(`📦 Loading ${template.name} template...`);

			// Mount files to container
			await currentContainer.mount(filesToMount);
			addTerminalOutput(`✅ ${template.name} files mounted`);

			// Load default file if specified
			if (template.defaultFile) {
				await handleFileSelect(template.defaultFile);
			}

			// Start installation and server in the background
			(async () => {
				try {
					if (template.installCommand) {
						addTerminalOutput("📥 Installing dependencies...");
						const installProcess = await runCommand("pnpm", [
							"install",
							"--no-lockfile",
						]);
						if (!installProcess) {
							set({ isLoading: false });
							return;
						}

						const exitCode = await installProcess.exit;
						if (exitCode === 0) {
							addTerminalOutput("✅ Dependencies installed successfully");
						} else {
							addTerminalOutput("❌ Failed to install dependencies");
							set({ isLoading: false });
							return;
						}
					}

					// Start development server
					if (template.startCommand) {
						addTerminalOutput("🔥 Starting development server...");
						const [command, ...args] = template.startCommand.split(" ");
						const process = await runCommand(command, args);
						if (process) {
							set({ serverProcess: process, isTemplateReady: true });
						}
					} else {
						set({ isTemplateReady: true });
					}

					toast.success(`${template.name} is ready to use!`);
				} catch (error) {
					addTerminalOutput(`❌ Error: ${error}`);
				} finally {
					set({ isLoading: false });
				}
			})();

			// Return template immediately after mounting
			return template;
		} catch (error) {
			addTerminalOutput(`❌ Error: ${error}`);
			set({ isLoading: false });
			return null;
		}
	},

	handleFileOperation: async (
		operation: "create" | "delete" | "rename",
		path: string,
		newPath?: string,
		content?: string,
	) => {
		const {
			webContainer,
			addTerminalOutput,
			getFileTree,
			setFiles,
			handleCloseFile,
		} = get();
		if (!webContainer) return;

		try {
			switch (operation) {
				case "create":
					await webContainer.fs.writeFile(path, content || "");
					addTerminalOutput(`📄 Created file: ${path}`);
					break;
				case "delete":
					await webContainer.fs.rm(path, { recursive: true });
					addTerminalOutput(`🗑️ Deleted: ${path}`);
					handleCloseFile(path);
					break;
				case "rename": {
					if (!newPath) {
						addTerminalOutput("❌ New path is required for rename operation");
						return;
					}
					const fileContent = await webContainer.fs.readFile(path);
					await webContainer.fs.writeFile(newPath, fileContent);
					await webContainer.fs.rm(path);
					addTerminalOutput(`📝 Renamed ${path} to ${newPath}`);
					break;
				}
			}

			// Refresh file tree after operation
			const updatedFiles = await getFileTree(".");
			setFiles(updatedFiles);
		} catch (error) {
			console.error(`Failed to ${operation} file:`, error);
			addTerminalOutput(`❌ Failed to ${operation} file: ${path}`);
		}
	},

	getFileTree: async (path: string) => {
		const { webContainer } = get();
		if (!webContainer) return {};

		try {
			const entries = await webContainer.fs.readdir(path, {
				withFileTypes: true,
			});
			const tree: FileSystemTree = {};

			for (const entry of entries) {
				const fullPath = `${path}/${entry.name}`;
				if (entry.isDirectory()) {
					tree[entry.name] = {
						directory: await get().getFileTree(fullPath),
					};
				} else {
					const content = await webContainer.fs.readFile(fullPath);
					// Convert Uint8Array to string if needed
					const fileContent =
						typeof content === "string"
							? content
							: new TextDecoder().decode(content);

					tree[entry.name] = {
						file: {
							contents: fileContent,
						},
					};
				}
			}

			return tree;
		} catch (error) {
			console.error("Failed to get file tree:", error);
			return {};
		}
	},

	setFiles: (files: FileSystemTree) => {
		set({ files });
	},

	handleFileSelect: async (path: string) => {
		const { webContainer, openFiles } = get();
		if (!webContainer) return;

		try {
			// Load from webContainer file system
			const content = await webContainer.fs.readFile(path);
			const fileContent =
				typeof content === "string"
					? content
					: new TextDecoder().decode(content);

			const fileName = path.split("/").pop() || path;
			const language = getLanguageFromPath(path);

			// Check if file is already open
			const existingFile = openFiles.find((file) => file.path === path);
			if (!existingFile) {
				set((state) => ({
					openFiles: [
						...state.openFiles,
						{
							path,
							name: fileName,
							content: fileContent,
							language,
							isDirty: false,
						},
					],
					activeFile: path,
				}));
			} else {
				set({ activeFile: path });
			}
		} catch (error) {
			console.error("Failed to open file:", error);
			toast.error("Failed to open file");
		}
	},

	handleFileContentChange: async (content: string) => {
		const { webContainer, activeFile, selectedTemplate, post, getFileTree } =
			get();
		if (!webContainer || !activeFile) return;

		try {
			await webContainer.fs.writeFile(activeFile, content);
			set((state) => ({
				openFiles: state.openFiles.map((file) =>
					file.path === activeFile
						? { ...file, content, isDirty: false }
						: file,
				),
			}));

			// Trigger non-blocking save to localStorage
			if (selectedTemplate && post) {
				// Fire and forget - don't await to avoid blocking
				getFileTree(".")
					.then((currentFiles) => {
						TemplateStorage.saveTemplate(
							post.id,
							selectedTemplate.id,
							selectedTemplate.name,
							currentFiles,
							selectedTemplate,
						);
					})
					.catch((error) => {
						console.warn("Failed to save template:", error);
					});
			}
		} catch (error) {
			console.error("Failed to save file:", error);
			toast.error("Failed to save file");
		}
	},

	handleCloseFile: (path: string) => {
		set((state) => {
			const newOpenFiles = state.openFiles.filter(
				(file) => file.path !== path && !file.path.startsWith(`${path}/`),
			);

			let newActiveFile = state.activeFile;
			const activeFileWasClosed =
				state.activeFile &&
				!newOpenFiles.some((file) => file.path === state.activeFile);

			if (activeFileWasClosed) {
				newActiveFile = newOpenFiles.length > 0 ? newOpenFiles[0].path : null;
			}

			return {
				openFiles: newOpenFiles,
				activeFile: newActiveFile,
			};
		});
	},

	clearOpenFiles: () => {
		set({ openFiles: [], activeFile: null });
	},

	resetToOriginalTemplate: async () => {
		const {
			webContainer,
			selectedTemplate,
			addTerminalOutput,
			runCommand,
			setFiles,
			clearOpenFiles,
			handleFileSelect,
			stopServer,
			cleanupContainer,
			post,
		} = get();
		if (!webContainer || !selectedTemplate) return;

		set({
			isLoading: true,
			isTemplateReady: false,
		});

		// Stop server and cleanup node_modules
		await stopServer();
		await cleanupContainer();

		// Clear saved template from localStorage
		if (post) {
			TemplateStorage.clearTemplate(post.id, selectedTemplate.id);
		}

		// Use original template files
		const filesToMount = selectedTemplate.files as FileSystemTree;

		setFiles(filesToMount);
		clearOpenFiles();

		try {
			addTerminalOutput(
				`📦 Loading original ${selectedTemplate.name} template...`,
			);

			// Mount files to container
			await webContainer.mount(filesToMount);
			addTerminalOutput(`✅ ${selectedTemplate.name} files mounted`);

			// Load default file if specified
			if (selectedTemplate.defaultFile) {
				await handleFileSelect(selectedTemplate.defaultFile);
			}
			// Start installation and server in the background
			(async () => {
				try {
					if (selectedTemplate.installCommand) {
						addTerminalOutput("📥 Installing dependencies...");
						const installProcess = await runCommand("pnpm", ["install"]);
						if (!installProcess) {
							set({ isLoading: false });
							return;
						}

						const exitCode = await installProcess.exit;
						if (exitCode === 0) {
							addTerminalOutput("✅ Dependencies installed successfully");
						} else {
							addTerminalOutput("❌ Failed to install dependencies");
							set({ isLoading: false });
							return;
						}
					}

					// Start development server
					if (selectedTemplate.startCommand) {
						addTerminalOutput("🔥 Starting development server...");
						const [command, ...args] = selectedTemplate.startCommand.split(" ");
						const process = await runCommand(command, args);
						if (process) {
							set({ serverProcess: process, isTemplateReady: true });
						}
					} else {
						set({ isTemplateReady: true });
					}

					toast.success(`${selectedTemplate.name} is ready to use!`);
				} catch (error) {
					addTerminalOutput(`❌ Error: ${error}`);
					toast.error(
						`Failed to load original ${selectedTemplate.name} template`,
					);
				} finally {
					set({ isLoading: false });
				}
			})();
		} catch (error) {
			addTerminalOutput(`❌ Error: ${error}`);
			toast.error(`Failed to load original ${selectedTemplate.name} template`);
			set({ isLoading: false });
		}
	},

	setLanguageDropdownDisabled: (disabled: boolean) => {
		set({ isLanguageDropdownDisabled: disabled });
	},

	setPost: (post: PostWithExtraDetails) => {
		set({ post });
	},

	// Test functions
	executeTests: async (): Promise<TestExecutionResult> => {
		const { webContainer, addTerminalOutput } = get();
		if (!webContainer) throw new Error("WebContainer not available");

		addTerminalOutput("🧪 Running tests...");

		// Run tests using the template's test command
		const testProcess = await webContainer.spawn("npm", ["run", "test"]);

		const outputChunks: string[] = [];
		testProcess.output.pipeTo(
			new WritableStream({
				write(data) {
					outputChunks.push(data);
					addTerminalOutput(data);
				},
			}),
		);

		const exitCode = await testProcess.exit;

		let jsonResult: VitestJsonResult | null = null;
		for (const chunk of outputChunks) {
			if (isJSON(chunk)) {
				const parsed = JSON.parse(chunk);
				if (parsed.testResults) {
					jsonResult = parsed;
					break;
				}
			}
		}

		// if no json result, try to parse with tap parser for javascript
		if (!jsonResult) {
			jsonResult = junitParser(outputChunks);
		}

		if (jsonResult && jsonResult.testResults.length > 0) {
			const numTotalTests = jsonResult.numTotalTests;
			const numPassedTests = jsonResult.numPassedTests;
			const numFailedTests = jsonResult.numFailedTests;
			const allTestsPassed = numFailedTests === 0 && numTotalTests > 0;

			const testResults = {
				numTotalTests,
				numPassedTests,
				numFailedTests,
				allTestsPassed,
			};

			set({ testResults });

			const summary = `Tests: ${numPassedTests} passed, ${numFailedTests} failed, ${numTotalTests} total`;
			addTerminalOutput(exitCode === 0 ? `✅ ${summary}` : `❌ ${summary}`);

			return {
				success: true,
				testResults,
				jsonResult,
				exitCode,
			};
		}

		// Fallback if no JSON found
		addTerminalOutput("⚠️ No test results found in output");
		return {
			success: false,
			testResults: null,
			jsonResult: null,
			exitCode,
		};
	},

	runTestsForValidation: async () => {
		try {
			set({ isRunningTests: true, testResults: null });

			const result = await get().executeTests();

			if (!result.success || !result.testResults) {
				return {
					success: false,
					hasTests: false,
					message: "No test cases found. Please add at least one test case.",
				};
			}

			const { testResults } = result;

			if (testResults.numTotalTests === 0) {
				return {
					success: false,
					hasTests: false,
					message: "No test cases found. Please add at least one test case.",
				};
			}

			if (!testResults.allTestsPassed) {
				return {
					success: false,
					hasTests: true,
					message: `${testResults.numFailedTests} test(s) failed. All tests must pass to proceed.`,
				};
			}

			return {
				success: true,
				hasTests: true,
				message: `All ${testResults.numTotalTests} test(s) passed successfully!`,
			};
		} catch (error) {
			const { addTerminalOutput } = get();
			addTerminalOutput(`❌ Error running tests: ${error}`);
			return {
				success: false,
				hasTests: false,
				message: `Error running tests: ${error}`,
			};
		} finally {
			set({ isRunningTests: false });
		}
	},

	clearTestResults: () => {
		set({ testResults: null });
	},
}));
