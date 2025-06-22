"use client";
import React, { FC } from "react";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { OnlineIDE } from "../playground/components/OnlineIde";
import { BottomPanel } from "../playground/components/ide/BottomPanel";
import { PreviewPanel } from "../playground/components/preview/PreviewPanel";
import { useWebContainerStore } from "../playground/store/webContainer";
import { Card } from "@/components/ui/card";
import { TemplateFramework } from "@prisma/client";

interface TemplateCreationInterfaceProps {
	selectedFramework: TemplateFramework;
}

const TemplateCreationInterface: FC<TemplateCreationInterfaceProps> = ({
	selectedFramework,
}) => {
	const { selectedTemplate } = useWebContainerStore();

	return (
		<div className="h-full">
			<ResizablePanelGroup
				className="max-w-screen p-2 !flex-col md:!flex-row h-full"
				direction="horizontal"
			>
				<ResizablePanel
					defaultSize={40}
					className="!basis-auto md:!basis-0 md:max-h-[calc(100vh-80px)]"
				>
					<Card className="h-full w-full p-4">
						<div className="flex flex-col h-full">
							<h3 className="text-lg font-semibold mb-4">Instructions</h3>
							<div className="flex-1 overflow-y-auto">
								<p className="text-sm text-muted-foreground">
									Create the question template for{" "}
									{selectedFramework.toLowerCase()} framework. This will be the
									starting point that users will see when they begin the
									challenge.
								</p>
								{/* Add more instruction content here */}
							</div>
						</div>
					</Card>
				</ResizablePanel>
				<ResizableHandle withHandle className="hidden md:flex bg-transparent" />
				<ResizablePanel className="!basis-auto md:!basis-0">
					<Card className="h-full w-full py-0">
						<ResizablePanelGroup direction="vertical" className="!flex-col">
							<ResizablePanel className="flex-1 !basis-auto md:!basis-0">
								<ResizablePanelGroup
									direction="horizontal"
									className="!flex-col md:!flex-row"
								>
									<ResizablePanel
										defaultSize={60}
										className="!basis-auto md:!basis-0 rounded-t-xl"
									>
										<OnlineIDE />
									</ResizablePanel>
									{selectedTemplate &&
										selectedTemplate.hasPreview !== false && (
											<>
												<ResizableHandle
													withHandle
													className="hidden md:flex bg-transparent"
												/>
												<ResizablePanel className="!basis-auto md:!basis-0">
													<PreviewPanel selectedTemplate={selectedTemplate} />
												</ResizablePanel>
											</>
										)}
								</ResizablePanelGroup>
							</ResizablePanel>
							<ResizableHandle
								withHandle
								className="hidden md:flex bg-transparent"
							/>
							<ResizablePanel
								defaultSize={30}
								className="!basis-auto md:!basis-0"
							>
								<BottomPanel />
							</ResizablePanel>
						</ResizablePanelGroup>
					</Card>
				</ResizablePanel>
			</ResizablePanelGroup>
		</div>
	);
};

export default TemplateCreationInterface;
