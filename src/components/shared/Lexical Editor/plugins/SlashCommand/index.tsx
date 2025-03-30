import { $createCodeNode } from "@lexical/code";
import {
	INSERT_CHECK_LIST_COMMAND,
	INSERT_ORDERED_LIST_COMMAND,
	INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
import {
	LexicalTypeaheadMenuPlugin,
	MenuOption,
	useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { INSERT_TABLE_COMMAND } from "@lexical/table";
import {
	$createParagraphNode,
	$getSelection,
	$isRangeSelection,
	createEditor,
	type LexicalEditor,
	type TextNode,
} from "lexical";
import { useCallback, useMemo, useState } from "react";
import * as React from "react";
import * as ReactDOM from "react-dom";
import {
	Code2,
	Columns2,
	Columns3,
	Columns4,
	DraftingCompass,
	ImageIcon,
	ImagePlayIcon,
	ListCheck,
	OctagonX,
	Pilcrow,
	QuoteIcon,
	SquarePenIcon,
	StepForward,
	Twitter,
	Youtube,
	Heading1,
	Heading2,
	Heading3,
	Minus,
	List,
	ListOrdered,
	Table,
	Sigma,
} from "lucide-react";

import { INSERT_COLLAPSIBLE_COMMAND } from "../CollapsiblePlugin";
import { cn } from "@/lib/utils";
import { INSERT_LAYOUT_COMMAND } from "../LayoutPlugin";
import { INSERT_POLL_COMMAND } from "../PollPlugin";
import { INSERT_HINT_COMMAND } from "../../nodes/Hint";
import useModal from "../../ui/models/use-model";
import {
	Command,
	CommandItem,
	CommandList,
	CommandInput,
	CommandEmpty,
	CommandShortcut,
} from "@/components/ui/command";
import { SHORTCUTS } from "../ShortcutsPlugin/shortcuts";
import { Skeleton } from "@/components/ui/skeleton";
import type { ImagePayload } from "../../nodes/ImageNode";
import { INSERT_IMAGE_COMMAND } from "../ImagesPlugin";
import {
	AutoEmbedDialog,
	TwitterEmbedConfig,
	YoutubeEmbedConfig,
} from "../AutoEmbedPlugin";
import {
	initialEditorState,
	INSERT_STEPPER_COMMAND,
} from "../../nodes/Stepper";
import { INSERT_EXCALIDRAW_COMMAND } from "../ExcalidrawPlugin";
import { useEditorContext } from "../../providers/EditorContext";
import { PLUGIN_NAMES } from "../../constants";
import { type pluginConfig, PluginConfigured } from "../../appSettings";
import {
	INSERT_EQUATION_COMMAND,
	InsertEquationDialog,
} from "../EquationsPlugin";
const InsertGif = React.lazy(() => import("../../ui/models/insert-gif"));
const InsertMediaDialog = React.lazy(() =>
	import("../../ui/models/insertMedia").then((module) => ({
		default: module.InsertMediaDialog,
	})),
);
class ComponentPickerOption extends MenuOption {
	// What shows up in the editor
	title: string;
	// Icon for display
	icon?: React.JSX.Element;
	// For extra searching.
	keywords: Array<string>;
	// TBD
	keyboardShortcut?: string;
	// What happens when you select this option?
	onSelect: (queryString: string) => void;
	desc?: string;
	constructor(
		title: string,
		options: {
			icon?: React.JSX.Element;
			keywords?: Array<string>;
			keyboardShortcut?: string;
			onSelect: (queryString: string) => void;
			desc?: string;
		},
	) {
		super(title);
		this.title = title;
		this.keywords = options.keywords || [];
		this.icon = options.icon;
		this.keyboardShortcut = options.keyboardShortcut;
		this.onSelect = options.onSelect.bind(this);
		this.desc = options.desc; // Add this line
	}
}

function getDynamicOptions(editor: LexicalEditor, queryString: string) {
	const options: Array<ComponentPickerOption> = [];

	if (queryString == null) {
		return options;
	}

	const tableMatch = queryString.match(/^([1-9]\d?)(?:x([1-9]\d?)?)?$/);

	if (tableMatch !== null) {
		const rows = tableMatch[1];
		const colOptions = tableMatch[2]
			? [tableMatch[2]]
			: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(String);

		options.push(
			...colOptions.map(
				(columns) =>
					new ComponentPickerOption(`${rows}x${columns} Table`, {
						icon: <i className="table icon" />,
						keywords: ["table"],
						onSelect: () =>
							editor.dispatchCommand(INSERT_TABLE_COMMAND, { columns, rows }),
					}),
			),
		);
	}

	return options;
}

function getBaseOptions(
	editor: LexicalEditor,
	pluginConfig: pluginConfig,
	showModal: (
		title?: string | null,
		description?: string | null,
		getContent?: (onClose: () => void) => React.JSX.Element,
		isDialog?: boolean,
	) => void,
) {
	// Get all enabled plugins
	const enabledPlugins = Object.entries(pluginConfig)
		.filter(([_, config]) => config.isEnabled && config.showInSlashCommand)
		.map(([pluginName, config]) => ({ pluginName, config }));

	return [
		...enabledPlugins.map(({ pluginName, config }) => {
			// Common properties from config
			const baseProps = {
				keywords: config.keywords,
				desc: config.desc,
				keyboardShortcut: config.keyboardShortcut,
			};

			switch (pluginName) {
				case PLUGIN_NAMES.PARAGRAPH:
					return new ComponentPickerOption(pluginName, {
						...baseProps,
						icon: <Pilcrow className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
						onSelect: () =>
							editor.update(() => {
								const selection = $getSelection();
								if ($isRangeSelection(selection)) {
									$setBlocksType(selection, () => $createParagraphNode());
								}
							}),
					});

				case PLUGIN_NAMES.HEADING_1:
				case PLUGIN_NAMES.HEADING_2:
				case PLUGIN_NAMES.HEADING_3:
					const n = Number.parseInt(pluginName.split(" ")[1]);
					return new ComponentPickerOption(pluginName, {
						...baseProps,
						icon:
							n === 1 ? (
								<Heading1 className="w-9 h-9 max-sm:h-5 max-sm:w-5" />
							) : n === 2 ? (
								<Heading2 className="w-9 h-9 max-sm:h-5 max-sm:w-5" />
							) : (
								<Heading3 className="w-9 h-9 max-sm:h-5 max-sm:w-5" />
							),
						onSelect: () =>
							editor.update(() => {
								const selection = $getSelection();
								if ($isRangeSelection(selection)) {
									$setBlocksType(selection, () => $createHeadingNode(`h${n}`));
								}
							}),
					});

				case PLUGIN_NAMES.TABLE:
					return new ComponentPickerOption(pluginName, {
						...baseProps,
						icon: <Table className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
						onSelect: () =>
							editor.dispatchCommand(INSERT_TABLE_COMMAND, {
								rows: "4",
								columns: "4",
							}),
					});

				case PLUGIN_NAMES.HINT:
					return new ComponentPickerOption(pluginName, {
						...baseProps,
						icon: <OctagonX className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
						onSelect: () => editor.dispatchCommand(INSERT_HINT_COMMAND, "hint"),
					});

				case PLUGIN_NAMES.EXCALIDRAW:
					return new ComponentPickerOption(pluginName, {
						...baseProps,
						icon: <DraftingCompass className="icon diagram-2" />,
						onSelect: () =>
							editor.dispatchCommand(INSERT_EXCALIDRAW_COMMAND, undefined),
					});

				case PLUGIN_NAMES.NUMBERED_LIST:
					return new ComponentPickerOption(pluginName, {
						...baseProps,
						icon: <ListOrdered className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
						onSelect: () =>
							editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined),
					});

				case PLUGIN_NAMES.BULLETED_LIST:
					return new ComponentPickerOption(pluginName, {
						...baseProps,
						icon: <List className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
						onSelect: () =>
							editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined),
					});

				case PLUGIN_NAMES.CHECK_LIST:
					return new ComponentPickerOption(pluginName, {
						...baseProps,
						icon: <ListCheck className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
						onSelect: () =>
							editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined),
					});

				case PLUGIN_NAMES.QUOTE:
					return new ComponentPickerOption(pluginName, {
						...baseProps,
						icon: <QuoteIcon className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
						onSelect: () =>
							editor.update(() => {
								const selection = $getSelection();
								if ($isRangeSelection(selection)) {
									$setBlocksType(selection, () => $createQuoteNode());
								}
							}),
					});

				case PLUGIN_NAMES.POLL:
					return new ComponentPickerOption(pluginName, {
						...baseProps,
						icon: <SquarePenIcon className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
						onSelect: () =>
							editor.dispatchCommand(INSERT_POLL_COMMAND, "type the Question"),
					});

				case PLUGIN_NAMES.CODE:
					return new ComponentPickerOption(pluginName, {
						...baseProps,
						icon: <Code2 className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
						onSelect: () =>
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
							}),
					});

				case PLUGIN_NAMES.DIVIDER:
					return new ComponentPickerOption(pluginName, {
						...baseProps,
						icon: <Minus className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
						onSelect: () =>
							editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined),
					});

				case PLUGIN_NAMES.YOUTUBE:
					return new ComponentPickerOption(pluginName, {
						...baseProps,
						icon: <Youtube className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
						onSelect: () => {
							showModal(
								PLUGIN_NAMES.YOUTUBE,
								"Insert a URL to embed a live preview. Works with YouTube",
								(onClose) => (
									<AutoEmbedDialog
										embedConfig={YoutubeEmbedConfig}
										onClose={onClose}
									/>
								),
								true,
							);
						},
					});

				case PLUGIN_NAMES.TWITTER:
					return new ComponentPickerOption(pluginName, {
						...baseProps,
						icon: <Twitter className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
						onSelect: () => {
							showModal(
								"Twitter tweet",
								"Insert a URL to embed a live preview. Works with Twitter",
								(onClose) => (
									<AutoEmbedDialog
										embedConfig={TwitterEmbedConfig}
										onClose={onClose}
									/>
								),
								true,
							);
						},
					});

				case PLUGIN_NAMES.IMAGE:
					return new ComponentPickerOption(pluginName, {
						...baseProps,
						icon: <ImageIcon className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
						onSelect: () =>
							showModal(
								"Insert Media",
								"Please select the Media to upload.",
								(onClose) => (
									<React.Suspense
										fallback={<Skeleton className="mx-2 w-[350px] h-[350px]" />}
									>
										<InsertMediaDialog
											activeEditor={editor}
											onClose={onClose}
										/>
									</React.Suspense>
								),
								true,
							),
					});

				case PLUGIN_NAMES.GIFS:
					return new ComponentPickerOption(pluginName, {
						...baseProps,
						icon: <ImagePlayIcon className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
						onSelect: () => {
							showModal(
								"Insert GIF",
								"Please select a GIF to upload.",
								(onClose) => (
									<React.Suspense
										fallback={<Skeleton className="mx-2 w-[400px] h-[400px]" />}
									>
										<InsertGif
											insertGifOnClick={(payload: ImagePayload) => {
												editor.dispatchCommand(INSERT_IMAGE_COMMAND, payload);
											}}
											onClose={onClose}
										/>
									</React.Suspense>
								),
								true,
							);
						},
					});

				case PLUGIN_NAMES.COLLAPSIBLE:
					return new ComponentPickerOption(pluginName, {
						...baseProps,
						icon: <StepForward className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
						onSelect: () =>
							editor.dispatchCommand(INSERT_COLLAPSIBLE_COMMAND, undefined),
					});

				case PLUGIN_NAMES.TWO_COLUMNS:
					return new ComponentPickerOption(pluginName, {
						...baseProps,
						icon: <Columns2 className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
						onSelect: () =>
							editor.dispatchCommand(INSERT_LAYOUT_COMMAND, "1fr 1fr"),
					});

				case PLUGIN_NAMES.THREE_COLUMNS:
					return new ComponentPickerOption(pluginName, {
						...baseProps,
						icon: <Columns3 className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
						onSelect: () =>
							editor.dispatchCommand(INSERT_LAYOUT_COMMAND, "1fr 1fr 1fr"),
					});

				case PLUGIN_NAMES.FOUR_COLUMNS:
					return new ComponentPickerOption(pluginName, {
						...baseProps,
						icon: <Columns4 className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
						onSelect: () =>
							editor.dispatchCommand(INSERT_LAYOUT_COMMAND, "1fr 1fr 1fr 1fr"),
					});

				case PLUGIN_NAMES.STEPPER:
					return new ComponentPickerOption(pluginName, {
						...baseProps,
						icon: (
							<svg
								className="w-9 h-9 max-sm:h-5 max-sm:w-5"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
							>
								<title>Stepper Icon</title>
								<g fill="none" fillRule="evenodd">
									<path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z" />
									<path
										fill="currentColor"
										d="M5 6a3 3 0 0 1 6 0v2a3 3 0 0 1-6 0zm3-1a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0V6a1 1 0 0 0-1-1m9.707-.707a1 1 0 0 0-1.414 0L13.465 7.12a1 1 0 0 0 1.414 1.415L16 7.414V20a1 1 0 1 0 2 0V7.414l1.121 1.122a1 1 0 1 0 1.415-1.415zM5 15a3 3 0 0 1 5.995-.176l.005.186c0 .408-.039.799-.107 1.171c-.264 1.433-.964 2.58-1.57 3.352c-.307.39-.598.694-.815.904c-.124.12-.25.238-.385.345a1 1 0 0 1-1.34-1.479L7.118 19l.224-.228A7 7 0 0 0 7.971 18A3 3 0 0 1 5 15m3-1a1 1 0 1 0 0 2a1 1 0 0 0 0-2"
									/>
								</g>
							</svg>
						),
						onSelect: () => {
							const newEditor = createEditor();
							const parsedEditorState = newEditor.parseEditorState(
								JSON.stringify(initialEditorState),
							);
							newEditor.setEditorState(parsedEditorState);
							const newStep = {
								id: 0,
								title: `New step 0`,
								content: newEditor,
							};
							editor.dispatchCommand(INSERT_STEPPER_COMMAND, [newStep]);
						},
					});
				case PLUGIN_NAMES.EQUATION:
					return new ComponentPickerOption(pluginName, {
						...baseProps,
						icon: <Sigma className="w-9 h-9 max-sm:h-5 max-sm:w-5" />,
						onSelect: () => {
							showModal(
								PLUGIN_NAMES.EQUATION,
								"Insert Equation",
								(onClose) => (
									<InsertEquationDialog
										activeEditor={editor}
										onClose={onClose}
									/>
								),
								true,
							);
						},
					});

				default:
					return null;
			}
		}),
	].filter(Boolean); // Remove any null entries from disabled plugins
}

export default function SlashCommand(): React.JSX.Element {
	const [editor] = useLexicalComposerContext();
	const [Modal, showModal] = useModal();
	const [queryString, setQueryString] = useState<string | null>(null);

	const checkForTriggerMatch = useBasicTypeaheadTriggerMatch("/", {
		minLength: 0,
	});

	const { pluginConfig } = useEditorContext();

	const options = useMemo(() => {
		const baseOptions = getBaseOptions(
			editor,
			pluginConfig,
			showModal,
		) as ComponentPickerOption[];

		if (!queryString) {
			return baseOptions;
		}

		const regex = new RegExp(queryString, "i");

		return [
			...getDynamicOptions(editor, queryString),
			...baseOptions.filter(
				(option) =>
					regex.test(option.title) ||
					option.keywords.some((keyword) => regex.test(keyword)),
			),
		];
	}, [editor, queryString]);

	const onSelectOption = useCallback(
		(
			selectedOption: ComponentPickerOption,
			nodeToRemove: TextNode | null,
			closeMenu: () => void,
			matchingString: string,
		) => {
			editor.update(() => {
				nodeToRemove?.remove();
				selectedOption.onSelect(matchingString);
				closeMenu();
			});
		},
		[editor, showModal],
	);

	return (
		<>
			<LexicalTypeaheadMenuPlugin<ComponentPickerOption>
				onQueryChange={setQueryString}
				onSelectOption={onSelectOption}
				triggerFn={checkForTriggerMatch}
				options={options}
				menuRenderFn={(
					anchorElementRef,
					{ selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
				) =>
					anchorElementRef.current && options.length
						? ReactDOM.createPortal(
								<div
									id={"toolbar"}
									className={`
                   overflow-x-hidden  z-[100]  relative  max-w-[300px] max-sm:w-[200px] w-[300px] max-h-[300px] h-fit   border rounded-sm  bg-background shadow-sm shadow-muted-foreground/20
                   
                   `}
								>
									<Command>
										<CommandInput placeholder="Type a command" />
										<CommandList>
											<CommandEmpty>No results found.</CommandEmpty>

											{options.map((option, i: number) => (
												<CommandItem
													ref={option.ref as React.Ref<HTMLDivElement>}
													className={cn(
														selectedIndex == i &&
															"dark:bg-gray-300/10 bg-gray-400/60",
														"gap-x-2 h-full items-start hover:bg-transparent border-0 bg-transparent  transition-colors  cursor-pointer rounded-sm relative",
													)}
													onSelect={() => {
														setHighlightedIndex(i);
														selectOptionAndCleanUp(option);
													}}
													onMouseEnter={() => {
														setHighlightedIndex(i);
													}}
													key={option.key}
												>
													<div className="h-full p-4 rounded-sm bg-gray-400/60 dark:bg-gray-300/10">
														{option.icon}
													</div>
													<div className="flex flex-row items-center justify-between">
														<div className="flex flex-col items-start justify-center">
															<div>{option.title}</div>
															<span className="text-sm break-words text-muted-foreground">
																{option.desc}
															</span>
														</div>
														{option.keyboardShortcut && (
															<CommandShortcut className="absolute top-1 right-2">
																{option.keyboardShortcut}
															</CommandShortcut>
														)}
													</div>
												</CommandItem>
											))}
										</CommandList>
									</Command>
								</div>,
								anchorElementRef.current,
							)
						: null
				}
			/>
			{Modal}
		</>
	);
}
