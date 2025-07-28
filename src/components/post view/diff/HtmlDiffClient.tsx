"use client";

import React, { useState, useEffect, startTransition } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import HtmlDiff from "htmldiff-js";
import { PostWithExtraDetails } from "@/utils/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Info } from "lucide-react";
import { HtmlRenderer } from "../../shared/HtmlRenderer";
import { ReactNode } from "react";

interface HtmlDiffClientProps {
	originalPost: PostWithExtraDetails;
	modifiedPost: PostWithExtraDetails;
	componentRenderer: (post: PostWithExtraDetails) => ReactNode;
}

const HtmlDiffClient: React.FC<HtmlDiffClientProps> = ({
	originalPost,
	modifiedPost,
	componentRenderer,
}) => {
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [diffHTML, setDiffHTML] = useState<string>("");

	useEffect(() => {
		const generateDiff = async () => {
			try {
				setIsLoading(true);
				setError(null);

				// Use startTransition to prevent suspension issues
				startTransition(() => {
					try {
						const originalHTML = renderToStaticMarkup(
							componentRenderer(originalPost),
						);
						const modifiedHTML = renderToStaticMarkup(
							componentRenderer(modifiedPost),
						);
						const result = HtmlDiff.execute(originalHTML, modifiedHTML);

						setDiffHTML(result);
						setIsLoading(false);
					} catch (err) {
						setError(
							err instanceof Error ? err.message : "Failed to generate diff",
						);
						setIsLoading(false);
					}
				});
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Failed to generate diff",
				);
				setIsLoading(false);
			}
		};

		generateDiff();
	}, [originalPost, modifiedPost, componentRenderer]);

	if (isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-8 w-3/4" />
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-5/6" />
				<Skeleton className="h-4 w-4/5" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-4 rounded-lg border border-destructive bg-destructive/10 text-destructive">
				<p className="font-medium">Error generating diff:</p>
				<p className="text-sm">{error}</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border m-2">
				<Info className="w-4 h-4 text-muted-foreground mt-0.5" />
				<div className="text-sm text-muted-foreground space-y-1">
					<div>
						<span className="bg-red-500/20 text-red-800 dark:bg-red-500/30 dark:text-red-200 px-1 py-0.5 rounded font-medium">
							Red
						</span>{" "}
						= Deleted content
					</div>
					<div>
						<span className="bg-green-500/20 text-green-800 dark:bg-green-500/30 dark:text-green-200 px-1 py-0.5 rounded font-medium">
							Green
						</span>{" "}
						= Added content
					</div>
				</div>
			</div>

			<div className="prose max-w-none [&_del]:bg-red-500/20 [&_del]:text-red-800 [&_del]:dark:bg-red-500/30 [&_del]:dark:text-red-200 [&_del]:px-1 [&_del]:py-0.5 [&_del]:rounded [&_ins]:bg-green-500/20 [&_ins]:text-green-800 [&_ins]:dark:bg-green-500/30 [&_ins]:dark:text-green-200 [&_ins]:px-1 [&_ins]:py-0.5 [&_ins]:rounded">
				<HtmlRenderer html={diffHTML} />
			</div>
		</div>
	);
};

export default HtmlDiffClient;
