import { Code2 } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import type { Template } from "../../lib/types";
import { useWebContainerStore } from "../../store/webContainer";
import { PreviewControls } from "./PreviewControls";
import { PreviewStartButton } from "./PreviewStartButton";

// Constants
const TEMPLATE_ICONS = {
	react: "⚛️",
	nextjs: "▲",
	vanilla: "🟨",
	vue: "💚",
} as const;

const TEMPLATE_NAMES = {
	react: "React",
	nextjs: "Next.js",
	vanilla: "Vanilla JS",
	vue: "Vue.js",
} as const;

// Types
interface PreviewPanelProps {
	selectedTemplate: Template | null;
}

interface LoadingStateProps {
	message: string;
	subMessage?: string;
	showDots?: boolean;
}

// Components
const LoadingState: React.FC<LoadingStateProps> = React.memo(
	({ message, subMessage, showDots }) => (
		<div className="h-full bg-background flex items-center justify-center min-h-96">
			<div className="text-center text-muted-foreground">
				<div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
				<p className="text-lg font-medium">{message}</p>
				{subMessage && <p className="text-sm mt-2">{subMessage}</p>}
				{showDots && (
					<div className="mt-4 flex justify-center">
						<div className="flex space-x-1">
							<div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
							<div
								className="w-2 h-2 bg-primary rounded-full animate-bounce"
								style={{ animationDelay: "0.1s" }}
							/>
							<div
								className="w-2 h-2 bg-primary rounded-full animate-bounce"
								style={{ animationDelay: "0.2s" }}
							/>
						</div>
					</div>
				)}
			</div>
		</div>
	),
);
LoadingState.displayName = "LoadingState";

const WelcomeState: React.FC = React.memo(() => (
	<div className="h-full bg-background flex items-center justify-center">
		<div className="text-center text-muted-foreground max-w-md">
			<Code2 className="w-16 h-16 mx-auto mb-6 text-muted-foreground/50" />
			<h3 className="text-xl font-semibold text-foreground mb-3">
				Welcome to Online IDE
			</h3>
			<p className="text-muted-foreground mb-6">
				Select a template from the dropdown above to start coding. Your changes
				will appear here in real-time.
			</p>
			<div className="grid grid-cols-2 gap-4 text-sm">
				{Object.entries(TEMPLATE_ICONS).map(([key, icon]) => (
					<div key={key} className="bg-card p-3 rounded-lg border">
						<div className="text-2xl mb-2">{icon}</div>
						<div className="font-medium">
							{TEMPLATE_NAMES[key as keyof typeof TEMPLATE_NAMES]}
						</div>
					</div>
				))}
			</div>
		</div>
	</div>
));
WelcomeState.displayName = "WelcomeState";

export function PreviewPanel({ selectedTemplate }: PreviewPanelProps) {
	const { previewUrl, isContainerReady } = useWebContainerStore();
	const [isLoading, setIsLoading] = useState(false);
	const [key, setKey] = useState(0);
	const [showPreview, setShowPreview] = useState(false);

	const handleRefresh = useCallback(() => {
		setIsLoading(true);
		setKey((prev) => prev + 1);
	}, []);

	const handleLoad = useCallback(() => {
		setIsLoading(false);
	}, []);

	const handleStartPreview = useCallback(() => {
		setShowPreview(true);
	}, []);

	const iframeProps = useMemo(
		() => ({
			key,
			src: previewUrl,
			className: "w-full h-full border-0",
			title: "Preview",
			onLoad: handleLoad,
			sandbox:
				"allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads",
		}),
		[key, previewUrl, handleLoad],
	);

	// Show the start button first if preview hasn't been started yet
	if (!showPreview) {
		return <PreviewStartButton onStart={handleStartPreview} />;
	}

	if (!isContainerReady) {
		return (
			<LoadingState
				message="Initializing WebContainer..."
				subMessage="Setting up the development environment"
			/>
		);
	}

	if (!selectedTemplate) {
		return <WelcomeState />;
	}

	if (!previewUrl) {
		return (
			<LoadingState
				message="Starting Development Server "
				subMessage={`Installing dependencies and building your ${selectedTemplate.name} app...`}
				showDots
			/>
		);
	}

	return (
		<div className="h-full relative">
			{isLoading && (
				<div className="absolute inset-0 bg-background/75 flex items-center justify-center z-10">
					<div className="text-center text-foreground">
						<div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
						<p className="text-sm">Refreshing preview...</p>
					</div>
				</div>
			)}
			<iframe {...iframeProps} className="min-h-96 w-full h-full" />
			<PreviewControls onRefresh={handleRefresh} url={previewUrl} />
		</div>
	);
}
