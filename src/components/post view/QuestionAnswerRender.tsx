"use client";

import React, { useState } from "react";
import { ContentRenderer } from "./ContentRenderer";
import { RiQuestionAnswerLine } from "react-icons/ri";
import { cn } from "@/lib/utils";

interface QuestionAnswerRenderProps {
	post?: string;
	answer?: string;
	className?: string;
	answerClassName?: string;
}

export const QuestionAnswerRender: React.FC<QuestionAnswerRenderProps> = ({
	post,
	answer,
	className = "",
	answerClassName = "",
}) => {
	const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

	const toggleAnswerReveal = () => {
		setIsAnswerRevealed(!isAnswerRevealed);
	};

	return (
		<div className={cn("max-w-3xl w-full", className)}>
			{post && (
				<div className="post-section">
					<ContentRenderer html={post} />
				</div>
			)}

			{answer && (
				<div className="answer-reveal-container">
					<div
						className={cn(
							"answer-reveal-content",
							isAnswerRevealed && "answer-revealed",
						)}
					>
						<div className="bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-green-950/30 dark:via-emerald-950/20 dark:to-green-950/40 border border-green-200 dark:border-green-800 rounded-xl p-6 my-8 shadow-lg relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:bg-gradient-to-b before:from-green-500 before:to-emerald-600 before:rounded-l-xl after:content-[''] after:absolute after:top-0 after:right-0 after:w-20 after:h-20 after:bg-green-100/20 dark:after:bg-green-900/10 after:rounded-full after:-translate-y-10 after:translate-x-10">
							<div className="flex items-center gap-2 mb-4 text-green-600 dark:text-green-400 font-semibold">
								<RiQuestionAnswerLine className="w-5 h-5" />
								<span>Answer</span>
							</div>
							<ContentRenderer html={answer} />
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
