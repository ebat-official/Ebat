"use client";

import React, { useState } from "react";
import { ContentRenderer } from "./ContentRenderer";
import { RiQuestionAnswerLine, RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import { cn } from "@/lib/utils";

interface QuestionAnswerRenderProps {
	answer?: string;
	className?: string;
}

export const QuestionAnswerRender: React.FC<QuestionAnswerRenderProps> = ({
	answer,
	className = "",
}) => {
	const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

	const toggleAnswerReveal = () => {
		setIsAnswerRevealed(!isAnswerRevealed);
	};

	return (
		<div className={cn(className)}>
			{answer && (
				<div className="relative min-h-[300px]">
					<div className="bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-green-950/30 dark:via-emerald-950/20 dark:to-green-950/40 border border-green-200 dark:border-green-800 rounded-xl p-6 my-8 shadow-lg relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:bg-gradient-to-b before:from-green-500 before:to-emerald-600 before:rounded-l-xl after:content-[''] after:absolute after:top-0 after:right-0 after:w-20 after:h-20 after:bg-green-100/20 dark:after:bg-green-900/10 after:rounded-full after:-translate-y-10 after:translate-x-10">
						<div className="flex items-center gap-2 mb-4 text-green-600 dark:text-green-400 font-semibold">
							<RiQuestionAnswerLine className="w-5 h-5" />
							<span>Answer</span>
						</div>
						<ContentRenderer html={answer} />
					</div>

					{/* Reveal Overlay */}
					<div
						className={cn(
							"absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-500 ease-out",
							isAnswerRevealed
								? "opacity-0 pointer-events-none"
								: "opacity-100 hover:bg-white/60 dark:hover:bg-gray-900/60",
						)}
						onClick={toggleAnswerReveal}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								toggleAnswerReveal();
							}
						}}
						role="button"
						tabIndex={0}
					>
						<div className="text-center space-y-4">
							<div className="space-y-2">
								<h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
									Click to Reveal Answer
								</h3>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									Tap anywhere to see the solution
								</p>
							</div>
						</div>

						{/* Revealed state indicator */}
						<div
							className={cn(
								"absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-all duration-300",
								isAnswerRevealed
									? "opacity-100 translate-y-0"
									: "opacity-0 -translate-y-2",
							)}
						>
							<RiEyeOffLine className="w-3 h-3" />
							Revealed
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
