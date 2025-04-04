import type {
  SerializedEditorState,
  SerializedLexicalNode,
  SerializedRootNode,
  SerializedTextNode,
} from "lexical";

/**
 * Checks if the Lexical editor content is empty.
 */
export function isLexicalEditorEmpty(
  content: SerializedEditorState | null | undefined
): boolean {
  if (!content?.root) return true;

  const root = content.root as SerializedRootNode;
  if (!root.children || root.children.length === 0) return true;

  return root.children.every(isEmptyLexicalNode);
}

/**
 * Type guard to check if a node is a SerializedTextNode
 */
function isTextNode(node: SerializedLexicalNode): node is SerializedTextNode {
  return node.type === "text";
}

/**
 * Checks if a text node is empty (whitespace-only or undefined)
 */
function isEmptyTextNode(node: SerializedTextNode): boolean {
  return !node.text || node.text.trim() === "";
}

/**
 * Checks if a single Lexical node is empty.
 */
function isEmptyLexicalNode(node: SerializedLexicalNode): boolean {
  if (node.type === "paragraph") {
    const paragraphNode = node as { children?: SerializedLexicalNode[] };
    return (
      !paragraphNode.children ||
      paragraphNode.children.length === 0 ||
      paragraphNode.children.every((child) =>
        isTextNode(child) ? isEmptyTextNode(child) : false
      )
    );
  }

  if (isTextNode(node)) {
    return isEmptyTextNode(node);
  }

  // All other node types are considered non-empty by default
  return false;
}
