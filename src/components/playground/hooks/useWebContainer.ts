import { useState, useCallback, useEffect } from "react";
import { WebContainer } from "@webcontainer/api";
import { useToast } from "@/hooks/use-toast";

export function useWebContainer() {
	const [webContainer, setWebContainer] = useState<WebContainer | null>(null);
	const [isContainerReady, setIsContainerReady] = useState(false);
	const [previewUrl, setPreviewUrl] = useState<string>("");
	const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
	const { toast } = useToast();

	const addTerminalOutput = useCallback((output: string) => {
		setTerminalOutput((prev) => [
			...prev,
			`${new Date().toLocaleTimeString()} ${output}`,
		]);
	}, []);

	useEffect(() => {
		const initContainer = async () => {
			try {
				addTerminalOutput("🚀 Initializing WebContainer...");
				const container = await WebContainer.boot();
				setWebContainer(container);
				setIsContainerReady(true);
				addTerminalOutput("✅ WebContainer ready!");

				container.on("server-ready", (port, url) => {
					setPreviewUrl(url);
					addTerminalOutput(`🌐 Server ready at ${url}`);
				});
			} catch (error) {
				console.error("Failed to initialize WebContainer:", error);
				addTerminalOutput("❌ Failed to initialize WebContainer");
				toast({
					title: "Error",
					description: "Failed to initialize WebContainer",
					variant: "destructive",
				});
			}
		};

		initContainer();
	}, [addTerminalOutput, toast]);

	const runCommand = useCallback(
		async (command: string, args: string[] = []) => {
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
		[webContainer, addTerminalOutput],
	);

	return {
		webContainer,
		isContainerReady,
		previewUrl,
		terminalOutput,
		addTerminalOutput,
		runCommand,
	};
}
