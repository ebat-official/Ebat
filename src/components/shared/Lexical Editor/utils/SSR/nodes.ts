import type { Klass, LexicalNode, LexicalNodeReplacement } from "lexical";

import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListNode, ListItemNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { OverflowNode } from "@lexical/overflow";
import { HashtagNode } from "@lexical/hashtag";
import { MarkNode } from "@lexical/mark";
import { BeautifulMentionNode } from "lexical-beautiful-mentions";
import { MentionNode } from "../../nodes/SSRNodes/MentionNode";
// import { BeautifulMentionNode } from "lexical-beautiful-mentions";

export type LexicalNodeType = Klass<LexicalNode> | LexicalNodeReplacement;
const nodes: LexicalNodeType[] = [
	HeadingNode,
	QuoteNode,
	ListNode,
	ListItemNode,
	LinkNode,
	CodeNode,
	CodeHighlightNode,

	AutoLinkNode, // For automatic link detection
	LinkNode, // For manual links
	//   HorizontalRuleNode, // For horizontal rules
	OverflowNode, // For handling overflow content
	HashtagNode, // For hashtags (optional, can be removed if not needed)
	MarkNode,
	MentionNode,
	//   BeautifulMentionNode,
];

export default nodes;
