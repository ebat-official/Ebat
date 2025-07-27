import React, { useMemo } from "react";
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
	hideUnchangedValues,
}: JsonDiffPatchProps) => {
	// Memoize expensive diff computation
	const htmlDiff = useMemo(() => {
		const jsondiffpatch = create(diffOptions || {});
		const delta = diff(left, right);
		return delta ? format(delta, left) : "";
	}, [left, right, diffOptions]);

	return (
		<div>
			<HtmlRenderer html={htmlDiff} />
		</div>
	);
};

export default React.memo(JsonDiffPatch);
