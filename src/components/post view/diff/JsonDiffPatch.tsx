import React, { useState, useEffect } from "react";
import { create, diff } from "jsondiffpatch";
import { format } from "jsondiffpatch/formatters/html";
import "jsondiffpatch/formatters/styles/html.css";
import { HtmlRenderer } from "../../shared/HtmlRenderer";

interface JsonDiffPatchProps {
	left: unknown;
	right: unknown;
	diffOptions?: Parameters<typeof create>[0];
	hideUnchangedValues?: boolean;
}

export const JsonDiffPatch = ({
	left,
	right,
	diffOptions,
}: JsonDiffPatchProps) => {
	const [htmlDiff, setHtmlDiff] = useState<string>("");

	useEffect(() => {
		try {
			const delta = diff(left, right);
			const result = delta ? format(delta, left) : "";
			setHtmlDiff(result || "");
		} catch (error) {
			console.error("Error generating JSON diff:", error);
			setHtmlDiff("");
		}
	}, [left, right, diffOptions]);

	return (
		<div>
			<HtmlRenderer html={htmlDiff} />
		</div>
	);
};

export default React.memo(JsonDiffPatch);
