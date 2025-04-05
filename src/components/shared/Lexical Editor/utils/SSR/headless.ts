import { createHeadlessEditor as _createHeadlessEditor } from "@lexical/headless";

import theme from "../../themes/editor-theme";
import { htmlConfig } from "./htmlConfig";
import nodes from "./nodes";

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
