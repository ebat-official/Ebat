import { createHeadlessEditor as _createHeadlessEditor } from "@lexical/headless";

import nodes from "../../nodes";
import theme from "../../themes/editor-theme";
import { htmlConfig } from "./htmlConfig";

const createHeadlessEditor = ({ namespace }: { namespace?: string }) => {
	return _createHeadlessEditor({
		namespace,
		nodes: [...nodes],
		theme: theme,
		onError: (e) => {
			console.error(e);
		},
		html: htmlConfig,
	});
};

export default createHeadlessEditor;
