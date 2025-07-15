import { Skeleton } from "@/components/ui/skeleton";
import { $createCodeNode } from "@lexical/code";
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
import { $patchStyleText, $setBlocksType } from "@lexical/selection";
import { $getSelection, $isRangeSelection, LexicalEditor } from "lexical";
import {
	AlertCircle,
	Code2,
	Columns2,
	Columns3,
	Columns4,
	DraftingCompass,
	FlipHorizontal2,
	Image,
	ImageIcon,
	ImagePlay,
	PencilRuler,
	Plus,
	Sigma,
	SquareChevronRight,
	SquarePenIcon,
	Table,
	Twitter,
	Youtube,
} from "lucide-react";
import React, { useMemo, lazy, Suspense } from "react";
import { boolean } from "zod";
import { DropDown } from ".";
import { PLUGIN_CONFIG } from "../../appSettings";
import { PLUGIN_NAMES } from "../../constants";
import { INSERT_HINT_COMMAND } from "../../nodes/Hint";
import {
	AutoEmbedDialog,
	YoutubeEmbedConfig,
} from "../../plugins/AutoEmbedPlugin";
import { INSERT_COLLAPSIBLE_COMMAND } from "../../plugins/CollapsiblePlugin";
import { INSERT_EXCALIDRAW_COMMAND } from "../../plugins/ExcalidrawPlugin";
import {
	INSERT_IMAGE_COMMAND,
	InsertImagePayload,
} from "../../plugins/ImagesPlugin";
import { INSERT_LAYOUT_COMMAND } from "../../plugins/LayoutPlugin";
import useModal from "../models/use-model";

const InsertMediaDialog = lazy(() =>
	import("../models/insertMedia").then((module) => ({
		default: module.InsertMediaDialog,
	})),
);
const InsertGif = lazy(() => import("../models/insert-gif"));
const InsertTableBody = lazy(() =>
	import("../../ui/models/insert-table").then((module) => ({
		default: module.InsertTable,
	})),
);

interface Items {
	label: string;
	icon: React.ReactNode;
	func: () => void;
	shortcuts?: string;
}

export default function InsertNode({
	disabled,
	editor,
}: {
	disabled: boolean;
	editor: LexicalEditor;
}) {
	const [model, showModal] = useModal();
	const insertGifOnClick = (payload: InsertImagePayload) => {
		editor.dispatchCommand(INSERT_IMAGE_COMMAND, payload);
	};

	const items: Items[] = useMemo(() => {
		// Filter out plugins that are not enabled
		const enabledPlugins = Object.entries(PLUGIN_CONFIG).filter(
			([_, config]) => config.isEnabled && config.showInInsertList,
		);

		// Map the enabled plugins to the items array
		return enabledPlugins
			.map(([pluginName]) => {
				// Define the base item structure with all required properties

				switch (pluginName) {
					case PLUGIN_NAMES.HORIZONTAL_RULE:
						return {
							label: pluginName,
							icon: <FlipHorizontal2 className="w-4 h-4" />,
							func: () =>
								editor.dispatchCommand(
									INSERT_HORIZONTAL_RULE_COMMAND,
									undefined,
								),
						};
					case PLUGIN_NAMES.MEDIA:
						return {
							label: pluginName,
							icon: <ImageIcon className="size-4" />,
							func: () => {
								showModal(
									PLUGIN_NAMES.MEDIA,
									"Please select the Media to upload.",
									(onClose) => (
										<Suspense
											fallback={
												<Skeleton className="mx-2 w-[350px] h-[350px]" />
											}
										>
											<InsertMediaDialog
												activeEditor={editor}
												onClose={onClose}
											/>
										</Suspense>
									),
									true,
								);
							},
						};
					case PLUGIN_NAMES.EXCALIDRAW:
						return {
							label: pluginName,
							icon: <DraftingCompass className="w-4 h-4" />,
							func: () =>
								editor.dispatchCommand(INSERT_EXCALIDRAW_COMMAND, undefined),
						};
					case PLUGIN_NAMES.CODE:
						return {
							label: pluginName,
							icon: <Code2 />,
							func: () => {
								editor.update(() => {
									const selection = $getSelection();
									if ($isRangeSelection(selection)) {
										if (selection.isCollapsed()) {
											$setBlocksType(selection, () => $createCodeNode());
										} else {
											const textContent = selection.getTextContent();
											const codeNode = $createCodeNode();
											selection.insertNodes([codeNode]);
											selection.insertRawText(textContent);
										}
									}
								});
							},
						};
					case PLUGIN_NAMES.GIFS:
						return {
							label: pluginName,
							icon: <ImagePlay className="w-4 h-4" />,
							func: () => {
								showModal(
									PLUGIN_NAMES.GIFS,
									"Please select a GIF to upload.",
									(onClose) => (
										<Suspense
											fallback={
												<Skeleton className="mx-2 w-[400px] h-[400px]" />
											}
										>
											<InsertGif
												insertGifOnClick={insertGifOnClick}
												onClose={onClose}
											/>
										</Suspense>
									),
									true,
								);
							},
						};
					case PLUGIN_NAMES.TABLE:
						return {
							label: pluginName,
							icon: <Table className="w-4 h-4" />,
							func: () => {
								showModal(
									PLUGIN_NAMES.TABLE,
									"Please configure your table.",
									(onClose) => (
										<Suspense
											fallback={
												<Skeleton className="mx-2 w-[400px] h-[100px]" />
											}
										>
											<InsertTableBody
												activeEditor={editor}
												onClose={onClose}
											/>
										</Suspense>
									),
									true,
								);
							},
						};
					case PLUGIN_NAMES.TWO_COLUMNS_EQUAL:
						return {
							label: pluginName,
							icon: <Columns2 className="w-4 h-4" />,
							func: () => {
								editor.dispatchCommand(INSERT_LAYOUT_COMMAND, "1fr 1fr");
							},
						};
					case PLUGIN_NAMES.THREE_COLUMNS_EQUAL:
						return {
							label: pluginName,
							icon: <Columns3 className="w-4 h-4" />,
							func: () => {
								editor.dispatchCommand(INSERT_LAYOUT_COMMAND, "1fr 1fr 1fr");
							},
						};
					case PLUGIN_NAMES.FOUR_COLUMNS_EQUAL:
						return {
							label: pluginName,
							icon: <Columns4 className="w-4 h-4" />,
							func: () => {
								editor.dispatchCommand(
									INSERT_LAYOUT_COMMAND,
									"1fr 1fr 1fr 1fr",
								);
							},
						};
					case PLUGIN_NAMES.TWO_COLUMNS_25_75:
						return {
							label: pluginName,
							icon: <Columns2 className="w-4 h-4" />,
							func: () => {
								editor.dispatchCommand(INSERT_LAYOUT_COMMAND, "1fr 3fr");
							},
						};
					case PLUGIN_NAMES.COLLAPSIBLE_CONTAINER:
						return {
							label: pluginName,
							icon: <SquareChevronRight className="w-4 h-4" />,
							func: () => {
								editor.dispatchCommand(INSERT_COLLAPSIBLE_COMMAND, undefined);
							},
						};
					case PLUGIN_NAMES.YOUTUBE:
						return {
							label: pluginName,
							icon: <Youtube />,
							func: () => {
								showModal(
									PLUGIN_NAMES.YOUTUBE,
									"Insert a URL to embed a live preview. Works with YouTube, Google Drive, Vimeo, and more.",
									(onClose) => (
										<AutoEmbedDialog
											embedConfig={YoutubeEmbedConfig}
											onClose={onClose}
										/>
									),
									true,
								);
							},
						};
					case PLUGIN_NAMES.HINT:
						return {
							label: pluginName,
							icon: <AlertCircle />,
							func: () => {
								editor.dispatchCommand(INSERT_HINT_COMMAND, "info");
							},
						};
				}
			})
			.filter(Boolean) as Items[];
	}, [editor, showModal]);
	return (
		<>
			<DropDown
				values={items}
				TriggerClassName={{ width: "115px" }}
				TriggerLabel={
					<>
						<Plus />
						<span>Insert</span>
					</>
				}
				disabled={disabled}
			/>
			{model}
		</>
	);
}
