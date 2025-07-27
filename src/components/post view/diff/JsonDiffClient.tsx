"use client";

import React, { useMemo } from "react";
import { PostWithExtraDetails } from "@/utils/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JsonDiffPatch from "./JsonDiffPatch";

interface JsonDiffClientProps {
	originalPost: PostWithExtraDetails;
	modifiedPost: PostWithExtraDetails;
}

const JsonDiffClient: React.FC<JsonDiffClientProps> = ({
	originalPost,
	modifiedPost,
}) => {
	// Memoize expensive data processing
	const { originalData, modifiedData } = useMemo(() => {
		// Convert any remaining Date objects to ISO strings to prevent hydration issues
		const sanitizeDates = (obj: unknown): unknown => {
			if (obj === null || obj === undefined) return obj;
			if (obj instanceof Date) return obj.toISOString();
			if (typeof obj === "object" && obj !== null) {
				const result: Record<string, unknown> = {};
				for (const [key, value] of Object.entries(obj)) {
					result[key] = sanitizeDates(value);
				}
				return result;
			}
			return obj;
		};

		// Remove fields that shouldn't be compared
		const cleanPostData = (post: PostWithExtraDetails) => {
			const { views, updatedAt, createdAt, ...cleanData } = post;
			return sanitizeDates(cleanData);
		};

		return {
			originalData: cleanPostData(originalPost),
			modifiedData: cleanPostData(modifiedPost),
		};
	}, [originalPost, modifiedPost]);

	return (
		<div className="max-w-[calc(100vw-288px)]  overflow-x-auto m-auto">
			<Tabs defaultValue="html" className="w-full">
				<TabsList className="w-fit bg-card mx-auto">
					<TabsTrigger className="" value="html">
						HTML Diff
					</TabsTrigger>
					<TabsTrigger value="raw">Raw JSON</TabsTrigger>
				</TabsList>

				<TabsContent value="html">
					<div className="p-4 rounded-lg overflow-auto text-sm border border-border">
						<JsonDiffPatch left={originalData} right={modifiedData} />
					</div>
				</TabsContent>

				<TabsContent value="raw">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<div>
							<h3 className="text-lg font-semibold text-red-600 mb-4">
								Original Version
							</h3>
							<pre className="p-4 rounded-lg overflow-auto text-sm border border-border bg-muted">
								<code>{JSON.stringify(originalData, null, 2)}</code>
							</pre>
						</div>

						<div>
							<h3 className="text-lg font-semibold text-green-600 mb-4">
								Modified Version
							</h3>
							<pre className="p-4 rounded-lg overflow-auto text-sm border border-border bg-muted">
								<code>{JSON.stringify(modifiedData, null, 2)}</code>
							</pre>
						</div>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default React.memo(JsonDiffClient);
