import type { Klass, LexicalNode } from "lexical";

import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { HashtagNode } from "@lexical/hashtag";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { MarkNode } from "@lexical/mark";
import { OverflowNode } from "@lexical/overflow";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { BeautifulMentionNode } from "lexical-beautiful-mentions";
const commentNodes: Array<Klass<LexicalNode>> = [
	HeadingNode, // For headings (e.g., H1, H2, H3)
	ListNode, // For unordered and ordered lists
	ListItemNode, // For list items
	QuoteNode, // For block quotes
	CodeNode, // For code blocks
	CodeHighlightNode, // For inline code highlighting
	AutoLinkNode, // For automatic link detection
	LinkNode, // For manual links
	HorizontalRuleNode, // For horizontal rules
	OverflowNode, // For handling overflow content
	HashtagNode, // For hashtags (optional, can be removed if not needed)
	MarkNode,
	BeautifulMentionNode, // For mentions (e.g., @username)
];

export default commentNodes;
