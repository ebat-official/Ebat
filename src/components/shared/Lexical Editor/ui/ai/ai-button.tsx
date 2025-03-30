import { Loader2, RotateCcw, StarsIcon, WandSparkles } from "lucide-react";
import React, { useMemo, useState } from "react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";
import { HoverBorderGradient } from "./border";
import { PlaceholdersAndVanishInput } from "./placeholder-input-vanish";
import { motion } from "framer-motion";
import {
	getSelectedText,
	insertText,
	insertTextUnderSelected,
	replaceSelectedText,
} from "../../utils/ai";
import { LexicalEditor } from "lexical";
import { useCompletion } from "@ai-sdk/react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { ExtractData } from "../../utils/extract-data";
import { AIAction } from "../../hooks/instructions-messages";
const placeholders = [
	"Chat with what you are writing.",
	"Click on the stepper to generate tasks step by step.",
	"Click on autocomplete to complete sentences.",
	"Is your text too long? Do you want to make it shorter?",
];
export default function AiButton({ editor }: { editor: LexicalEditor }) {
	const [actionType, setActionType] = useState<AIAction | null>(null); // track the user action
	const [streamedResponse, setStreamedResponse] = useState<string>("");

	const { completion, isLoading, complete, handleInputChange, input } =
		useCompletion({
			api: "/api/ai",
			onError: (err) => {
				toast.error(err.message);
			},
			onResponse: (response) => {
				setStreamedResponse("");
			},
			onFinish: (prompt, compeletion) => {
				if (actionType === "Steps") {
					setStreamedResponse(compeletion);
				}
			},
		});
	const handleAction = async (
		action: AIAction,
		payload: {
			prompt?: string;
			question?: string;
			context?: string;
		},
	) => {
		try {
			await complete("", {
				body: {
					action,
					...payload,
				},
			});
			setActionType(action);
		} catch (err) {
			toast.error("Failed to process AI action. Please try again.");
		}
	};
	const handleRegeneration = async () => {
		if (!completion) {
			toast.error("No content to regenerate");
			return;
		}
		await handleAction("GenerateAgain", { prompt: completion });
	};

	const handleAutoComplete = async () => {
		const selectedText = getSelectedText(editor, 30);
		await handleAction("autoComplete", { prompt: selectedText });
	};
	const handleImproveWriting = async () => {
		const selectedText = getSelectedText(editor);
		await handleAction("ImproveWriting", { prompt: selectedText });
	};
	const handleSimplifyLanguage = async () => {
		const selectedText = getSelectedText(editor);
		await handleAction("SimplifyLanguage", { prompt: selectedText });
	};
	const handleMakeLong = async () => {
		const selectedText = getSelectedText(editor);
		await handleAction("MakeLong", { prompt: selectedText });
	};
	const handleMakeShort = async () => {
		const selectedText = getSelectedText(editor);
		await handleAction("MakeShort", { prompt: selectedText });
	};
	const handleFixSpellingGrammar = async () => {
		const selectedText = getSelectedText(editor);
		await handleAction("FixSpellingGrammar", { prompt: selectedText });
	};
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!input) {
			toast.error("Please enter a question or instruction");
			return;
		}
		if (actionType === "Steps") {
			await handleAction("Steps", { prompt: input });
		} else {
			const data = ExtractData(editor);
			const selectedText = getSelectedText(editor, 30);
			if (!selectedText) {
				toast.error("Please select some text first");
				return;
			}
			await handleAction("ChatWithSelectedString", {
				prompt: input,
				context: data,
			});
			setActionType(null);
		}
	};

	const renderSteps = () => {
		if (!streamedResponse) return null;

		try {
			const steps = JSON.parse(streamedResponse);
			return (
				<ul className="list-none space-y-2">
					{steps.map((step: { id: number; title: string; content: string }) => (
						<li key={step.id} className="rounded-md shadow-md p-1">
							<h3 className="font-semibold text-lg">
								{step.id + 1}. {step.title}
							</h3>
							<p className="text-gray-600 dark:text-gray-300 mtx-2">
								{step.content}
							</p>
						</li>
					))}
				</ul>
			);
		} catch (error) {
			return;
		}
	};
	const Actions = useMemo(
		() => ({
			suggestion: [
				{
					icon: (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="size-5 text-purple-500"
							viewBox="0 0 24 24"
						>
							<path
								fill="currentColor"
								d="m19 9l-1.25-2.75L15 5l2.75-1.25L19 1l1.25 2.75L23 5l-2.75 1.25Zm0 14l-1.25-2.75L15 19l2.75-1.25L19 15l1.25 2.75L23 19l-2.75 1.25ZM4.8 16L8 7h2l3.2 9h-1.9l-.7-2H7.4l-.7 2Zm3.05-3.35h2.3L9 9ZM9 18q2.5 0 4.25-1.75T15 12q0-2.5-1.75-4.25T9 6Q6.5 6 4.75 7.75T3 12q0 2.5 1.75 4.25T9 18Zm0 2q-3.35 0-5.675-2.325Q1 15.35 1 12q0-3.35 2.325-5.675Q5.65 4 9 4q3.35 0 5.675 2.325Q17 8.65 17 12q0 3.35-2.325 5.675Q12.35 20 9 20Z"
							></path>
						</svg>
					),
					label: "auto compeletion",
					HoverCard: {
						desc: "Improve your sentences effortlessly—just select the text you want to refine, and let AI work its magic! ✨",
					},
					onClick: handleAutoComplete,
				},
				{
					icon: (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="size-5 text-purple-500"
							viewBox="0 0 24 24"
						>
							<path
								fill="currentColor"
								d="M7.5 5.6L10 7L8.6 4.5L10 2L7.5 3.4L5 2l1.4 2.5L5 7zm12 9.8L17 14l1.4 2.5L17 19l2.5-1.4L22 19l-1.4-2.5L22 14zM22 2l-2.5 1.4L17 2l1.4 2.5L17 7l2.5-1.4L22 7l-1.4-2.5zm-7.63 5.29a.996.996 0 0 0-1.41 0L1.29 18.96a.996.996 0 0 0 0 1.41l2.34 2.34c.39.39 1.02.39 1.41 0L16.7 11.05a.996.996 0 0 0 0-1.41zm-1.03 5.49l-2.12-2.12l2.44-2.44l2.12 2.12z"
							></path>
						</svg>
					),
					label: "Improve Writing",
					HoverCard: {
						desc: " Simply select the text you want, and let our AI refine your writing effortlessly! 📝🚀",
					},
					onClick: handleImproveWriting,
				},

				{
					icon: (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="size-5 text-purple-500"
							viewBox="0 0 24 24"
						>
							<path
								fill="currentColor"
								d="m9 16.2l-3.5-3.5a.984.984 0 0 0-1.4 0a.984.984 0 0 0 0 1.4l4.19 4.19c.39.39 1.02.39 1.41 0L20.3 7.7a.984.984 0 0 0 0-1.4a.984.984 0 0 0-1.4 0z"
							></path>
						</svg>
					),
					label: "Fix spelling & grammar",
					HoverCard: {
						desc: "📝 Select your messy text, and let AI transform it into perfection! 🚀",
					},
					onClick: handleFixSpellingGrammar,
				},
			],
			Edit: [
				{
					icon: (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-4 flex-shrink-0 w-4 block text-green-400"
							viewBox="0 0 20 20"
						>
							<path
								fill="currentColor"
								d="M3.5 5a.5.5 0 0 0 0 1h13a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h13a.5.5 0 0 0 0-1zm0 7h7.002l.416-1H3.5a.5.5 0 0 0 0 1m8.668-4l-.416 1H3.5a.5.5 0 0 1 0-1zm-.667 6.012h1.75l-.59 2.363c-.121.485.462.828.826.488l4.873-4.556c.497-.466.169-1.301-.512-1.301H16.75l.781-2.347a.5.5 0 0 0-.474-.659h-3.473a.5.5 0 0 0-.462.308l-2.083 5.01a.5.5 0 0 0 .462.694"
							></path>
						</svg>
					),
					label: "Make longer",
					HoverCard: {
						desc: "Enhance your text by adding more detail and context. Let AI expand your ideas! 🚀",
					},
					onClick: handleMakeLong,
				},
				{
					icon: (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-4 flex-shrink-0 w-4 block text-green-400"
							viewBox="0 0 32 32"
						>
							<path fill="currentColor" d="M6 18h14v2H6zm0-6h20v2H6z"></path>
						</svg>
					),
					label: "Make shorter",
					HoverCard: {
						desc: "Select your dummy short paragraph and let our AI expand it while preserving its original content! 🚀✨",
					},
					onClick: handleMakeShort,
				},
				{
					icon: (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-4 flex-shrink-0 w-4 block text-green-400"
							viewBox="0 0 24 24"
						>
							<path
								fill="currentColor"
								fillRule="evenodd"
								d="M12.75 18.96V22h-1.5v-3.04A7 7 0 0 1 5 12v-2h1.5v2a5.5 5.5 0 0 0 11 0v-2H19v2a7 7 0 0 1-6.25 6.96M8 6a4 4 0 1 1 8 0v6a4 4 0 1 1-8 0z"
							></path>
						</svg>
					),
					label: "Simplify Language",
					HoverCard: {
						desc: "If you're using overly complex language and want to simplify it for easier understanding, let our AI transform your text into clear, concise, and engaging content! 😊✨",
					},
					onClick: handleSimplifyLanguage,
				},
			],
			format_block: [
				{
					icon: (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="size-5 text-yellow-400"
							viewBox="0 0 24 24"
						>
							<g fill="none">
								<path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"></path>
								<path
									fill="currentColor"
									d="M5.436 16.72a1.466 1.466 0 0 1 1.22 2.275a1.466 1.466 0 0 1-1.22 2.275c-.587 0-1.134-.21-1.38-.79c-.153-.361-.112-.79.297-.963a.65.65 0 0 1 .852.344a.18.18 0 0 0 .165.11c.114-.003.23-.026.23-.168c0-.1-.073-.143-.156-.155l-.051-.003a.65.65 0 0 1-.112-1.29l.112-.01c.102 0 .207-.037.207-.158c0-.141-.116-.165-.23-.168a.18.18 0 0 0-.164.11a.65.65 0 0 1-.853.345c-.409-.174-.45-.603-.297-.963c.246-.58.793-.79 1.38-.79ZM20 17.5a1.5 1.5 0 0 1 0 3H9a1.5 1.5 0 0 1 0-3zM6.08 9.945a1.552 1.552 0 0 1 .43 2.442l-.554.593h.47a.65.65 0 1 1 0 1.3H4.573a.655.655 0 0 1-.655-.654c0-.207.029-.399.177-.557L5.559 11.5c.142-.152.03-.473-.203-.415c-.087.022-.123.089-.134.165l-.004.059a.65.65 0 1 1-1.3 0c0-.692.439-1.314 1.123-1.485c.35-.088.718-.04 1.04.121ZM20 10.5a1.5 1.5 0 0 1 .144 2.993L20 13.5H9a1.5 1.5 0 0 1-.144-2.993L9 10.5zM6.15 3.39v3.24a.65.65 0 0 1-1.3 0V4.523a.65.65 0 0 1-.46-1.184l.742-.494a.655.655 0 0 1 1.018.544ZM20 3.5a1.5 1.5 0 0 1 .144 2.993L20 6.5H9a1.5 1.5 0 0 1-.144-2.993L9 3.5z"
								></path>
							</g>
						</svg>
					),
					label: "Step-by-Step Guide",
					HoverCard: {
						desc: "Need a clear roadmap to programming mastery? step-by-step guide that breaks down complex topics into simple, actionable steps. Let it light your path to coding success! 🚀💻",
					},
					onClick: () => setActionType("Steps"),
				},
			],
		}),
		[],
	);

	const response = useMemo(
		() => [
			{
				icon: (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="text-[#8d5bc1] size-5"
						viewBox="0 0 16 16"
					>
						<path
							fill="currentColor"
							fillRule="evenodd"
							d="M0 3.2c0-1.12 0-1.68.218-2.11C.41.714.716.408 1.092.216c.428-.218.988-.218 2.11-.218h.6c1.12 0 1.68 0 2.11.218c.376.192.682.498.874.874c.218.428.218.988.218 2.11v.6c0 1.12 0 1.68-.218 2.11a2 2 0 0 1-.874.874c-.428.218-.988.218-2.11.218h-.6c-1.12 0-1.68 0-2.11-.218a2 2 0 0 1-.874-.874C0 5.482 0 4.922 0 3.8zM3.2 1h.6c.577 0 .949 0 1.23.024c.272.022.372.06.422.085c.188.096.341.249.437.437c.025.05.063.15.085.422c.023.283.024.656.024 1.23v.6c0 .577 0 .949-.024 1.23c-.022.272-.06.372-.085.422a1 1 0 0 1-.437.437c-.05.025-.15.063-.422.085c-.283.023-.656.024-1.23.024h-.6c-.577 0-.949 0-1.23-.024c-.272-.022-.372-.06-.422-.085a1 1 0 0 1-.437-.437c-.025-.05-.063-.15-.085-.422a17 17 0 0 1-.024-1.23v-.6c0-.577 0-.949.024-1.23c.022-.272.06-.372.085-.422c.096-.188.249-.341.437-.437c.05-.025.15-.063.422-.085C2.253 1 2.626 1 3.2 1M9 12.2c0-1.12 0-1.68.218-2.11c.192-.376.498-.682.874-.874c.428-.218.988-.218 2.11-.218h.6c1.12 0 1.68 0 2.11.218c.376.192.682.498.874.874c.218.428.218.988.218 2.11v.6c0 1.12 0 1.68-.218 2.11a2 2 0 0 1-.874.874c-.428.218-.988.218-2.11.218h-.6c-1.12 0-1.68 0-2.11-.218a2 2 0 0 1-.874-.874C9 14.482 9 13.922 9 12.8zm3.8-2.2c.577 0 .949 0 1.23.024c.272.022.372.06.422.085c.188.096.341.249.437.437c.025.05.063.15.085.422c.023.283.024.656.024 1.23v.6c0 .577 0 .949-.024 1.23c-.022.272-.06.372-.085.422a1 1 0 0 1-.437.437c-.05.025-.15.063-.422.085c-.283.023-.656.024-1.23.024h-.6c-.577 0-.949 0-1.23-.024c-.272-.022-.372-.06-.422-.085a1 1 0 0 1-.437-.437c-.025-.05-.063-.15-.085-.422a17 17 0 0 1-.024-1.23v-.6c0-.577 0-.949.024-1.23c.022-.272.06-.372.085-.422c.096-.188.249-.341.437-.437c.05-.025.15-.063.422-.085c.283-.023.656-.024 1.23-.024z"
							clipRule="evenodd"
						></path>
						<path
							fill="currentColor"
							d="M8 2.5a.5.5 0 0 1 .5-.5h2A2.5 2.5 0 0 1 13 4.5v1.79l1.15-1.15a.5.5 0 0 1 .707.707l-2 2a.5.5 0 0 1-.707 0l-2-2a.5.5 0 0 1 .707-.707l1.15 1.15V4.5a1.5 1.5 0 0 0-1.5-1.5h-2a.5.5 0 0 1-.5-.5zM3.31 8.04a.5.5 0 0 1 .188-.038h.006a.5.5 0 0 1 .351.146l2 2a.5.5 0 0 1-.707.707l-1.15-1.15v1.79a1.5 1.5 0 0 0 1.5 1.5h2a.5.5 0 0 1 0 1h-2a2.5 2.5 0 0 1-2.5-2.5v-1.79l-1.15 1.15a.5.5 0 0 1-.707-.707l2-2a.5.5 0 0 1 .162-.109z"
						></path>
					</svg>
				),
				label: "rplace text",
				HoverCard: {
					desc: "Select your text and let our AI replace it with a polished, enhanced version! 🚀✨",
				},
				func: () => replaceSelectedText(completion, editor),
			},
			{
				icon: (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="text-[#8d5bc1] size-5"
						viewBox="0 0 56 56"
					>
						<path
							fill="currentColor"
							d="M33.8 11.36h16.01c1.008 0 1.804-.774 1.804-1.782c0-.984-.797-1.758-1.804-1.758H33.8c-1.008 0-1.782.774-1.782 1.758c0 1.008.774 1.781 1.782 1.781M7.083 26.944c1.71 0 2.695-1.195 2.695-3.093v-4.477c0-.516.235-.82.797-.82h6.375v2.343c0 1.852 1.875 2.555 3.281 1.43l6.352-5.062c.96-.774.96-2.11 0-2.86L20.23 9.32c-1.453-1.195-3.28-.469-3.28 1.43v2.438h-6.891c-3.305 0-5.672 2.039-5.672 5.367v5.297c0 1.898.984 3.093 2.695 3.093m26.719-3.304h16.008c1.008 0 1.804-.774 1.804-1.782c0-.984-.797-1.758-1.804-1.758H33.8c-1.008 0-1.782.774-1.782 1.758c0 1.008.774 1.782 1.782 1.782M6.168 35.92h43.64a1.786 1.786 0 0 0 1.805-1.78c0-.985-.797-1.758-1.804-1.758H6.168c-1.008 0-1.781.773-1.781 1.758c0 .984.773 1.78 1.78 1.78m0 12.259h43.64c1.008 0 1.805-.774 1.805-1.758s-.797-1.781-1.804-1.781H6.168a1.766 1.766 0 0 0-1.781 1.78c0 .985.773 1.759 1.78 1.759"
						></path>
					</svg>
				),
				label: "insert text",
				HoverCard: {
					desc: "text will inserted immediately following your selection.",
				},
				func: () => insertText(completion, editor),
			},
			{
				icon: (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="text-[#8d5bc1] size-5"
						viewBox="0 0 14 14"
					>
						<g
							fill="none"
							stroke="currentColor"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M9.5 6.5h-9m13-3H.5m13-3H.5"></path>
							<rect
								width="4"
								height="13"
								x="5"
								y="5"
								rx=".5"
								transform="rotate(-90 7 11.5)"
							></rect>
						</g>
					</svg>
				),
				label: "insert below",
				HoverCard: {
					desc: "text will inserted under your selection.",
				},
				func: () => insertTextUnderSelected(completion, editor),
			},

			{
				icon: <RotateCcw className="text-[#8d5bc1] size-4" />,
				label: "try again",
				HoverCard: {
					desc: "you did not like the ai response? try it again with what do you want",
				},
				func: handleRegeneration,
			},
		],
		[completion],
	);

	return (
		<Popover>
			<PopoverTrigger asChild>
				<button className="inline-flex px-6 max-sm:py-2 max-sm:px-[5px]  h-6 animate-background-shine items-center justify-center rounded-md border border-gray-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%]   font-medium text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-50">
					<WandSparkles className=" size-4 text-purple-400" />
				</button>
			</PopoverTrigger>
			<PopoverContent className="absolute max-h-[300px] h-fit shadow-sm  shadow-black dark:shadow-gray-500  p-0 w-[420px] max-sm:w-[200px] min-w-[200px] max-w-[420px] top-[10px] max-sm:left-6 -left-7 AI-format">
				<div className="w-full relative">
					<div className="flex flex-col items-start justify-between">
						{(completion || actionType === "Steps") && (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, ease: "easeOut" }}
								className="cursor-text w-full p-2 z-20 break-words max-h-64 h-fit overflow-y-auto"
							>
								{streamedResponse !== "" ? (
									renderSteps()
								) : (
									<ReactMarkdown>
										{completion ||
											"Ask for a step-by-step guide on any programming topic. Example: 'How can I become a backend developer?'"}
									</ReactMarkdown>
								)}
							</motion.div>
						)}
						<div className="relative w-full">
							<div className=" absolute top-1/2 -translate-y-1/2 left-2">
								<HoverBorderGradient
									duration={2}
									clockwise={false}
									containerClassName="rounded-full border-0"
									as="button"
									className="dark:bg-white size-5  bg-black dark:text-white flex justify-center items-center"
								>
									{isLoading ? (
										<Loader2 className="size-3 dark:text-black text-white animate-spin" />
									) : (
										<StarsIcon className="dark:text-purple-600 text-purple-300 size-3" />
									)}
								</HoverBorderGradient>
							</div>
							<PlaceholdersAndVanishInput
								placeholders={placeholders}
								onChange={handleInputChange}
								onSubmit={handleSubmit}
								disabled={isLoading}
							/>
						</div>
					</div>
					<div className="w-[200px] h-[180px] z-50 rounded border mt-2 fixed">
						{!completion ? (
							<Command id="toolbar" className="w-full ">
								<CommandInput placeholder="Type a command" />
								<CommandList>
									<CommandEmpty>No results found.</CommandEmpty>
									<CommandGroup heading="Suggested">
										{Actions.suggestion.map((sug) => (
											<HoverCard key={sug.label}>
												<HoverCardTrigger
													onClick={sug.onClick}
													className="w-full p-0"
												>
													<CommandItem className="w-full">
														<div>{sug.icon}</div>
														<span>{sug.label}</span>
													</CommandItem>
												</HoverCardTrigger>
												<HoverCardContent
													className=" p-2"
													side="right"
													alignOffset={60}
													sideOffset={30}
												>
													<span className="text-sm break-words   text-muted-foreground">
														{sug.HoverCard.desc}
													</span>
												</HoverCardContent>
											</HoverCard>
										))}
									</CommandGroup>

									<CommandSeparator />
									<CommandGroup heading="format block">
										{Actions.format_block.map((sug) => (
											<HoverCard key={sug.label}>
												<HoverCardTrigger
													onClick={sug.onClick}
													className="w-full p-0"
												>
													<CommandItem className="w-full">
														<div>{sug.icon}</div>
														<span>{sug.label}</span>
													</CommandItem>
												</HoverCardTrigger>
												<HoverCardContent
													className=" p-2"
													side="right"
													alignOffset={60}
													sideOffset={30}
												>
													<span className="text-sm break-words   text-muted-foreground">
														{sug.HoverCard.desc}
													</span>
												</HoverCardContent>
											</HoverCard>
										))}
									</CommandGroup>
									<CommandSeparator />

									<CommandGroup heading="Edit">
										{Actions.Edit.map((sug) => (
											<HoverCard key={sug.label}>
												<HoverCardTrigger
													onClick={sug.onClick}
													className="w-full p-0"
												>
													<CommandItem className="w-full">
														<div>{sug.icon}</div>
														<span>{sug.label}</span>
													</CommandItem>
												</HoverCardTrigger>
												<HoverCardContent
													className="p-2"
													side="right"
													alignOffset={60}
													sideOffset={30}
												>
													<span className="text-sm  text-muted-foreground">
														{sug.HoverCard.desc}
													</span>
												</HoverCardContent>
											</HoverCard>
										))}
									</CommandGroup>
								</CommandList>
							</Command>
						) : (
							<Command id="toolbar" className="w-full">
								<CommandInput placeholder="Type a command" />
								<CommandList>
									<CommandEmpty>No results found.</CommandEmpty>
									<CommandGroup>
										{response.map((sug) => (
											<HoverCard key={sug.label}>
												<HoverCardTrigger
													onClick={sug.func}
													className="w-full p-0"
												>
													<CommandItem disabled={isLoading} className="w-full">
														<div>{sug.icon}</div>
														<span>{sug.label}</span>
													</CommandItem>
												</HoverCardTrigger>
												<HoverCardContent
													className=" p-2"
													side="right"
													alignOffset={60}
													sideOffset={30}
												>
													<span className="text-sm break-words   text-muted-foreground">
														{sug.HoverCard.desc}
													</span>
												</HoverCardContent>
											</HoverCard>
										))}
									</CommandGroup>
								</CommandList>
							</Command>
						)}
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
