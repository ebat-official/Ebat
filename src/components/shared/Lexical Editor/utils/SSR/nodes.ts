import type { Klass, LexicalNode, LexicalNodeReplacement } from "lexical";

import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { HashtagNode } from "@lexical/hashtag";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { MarkNode } from "@lexical/mark";
import { OverflowNode } from "@lexical/overflow";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { BeautifulMentionNode } from "lexical-beautiful-mentions";
import { CollapsibleContainerNode } from "../../nodes/CollapsibleNode/CollapsibleContainerNode";
import { CollapsibleContentNode } from "../../nodes/CollapsibleNode/CollapsibleContentNode";
import { CollapsibleTitleNode } from "../../nodes/CollapsibleNode/CollapsibleTitleNode";
import { Hint } from "../../nodes/Hint";
import { LayoutContainerNode } from "../../nodes/LayoutNode/LayoutContainerNode";
import { LayoutItemNode } from "../../nodes/LayoutNode/LayoutItemNode";
import { HintNode } from "../../nodes/SSRNodes/HintNode";
import { HorizontalRuleNode } from "../../nodes/SSRNodes/HorizontalRuleNode";
import { ImageNode } from "../../nodes/SSRNodes/ImageNode";
import { MentionNode } from "../../nodes/SSRNodes/MentionNode";
import { YouTubeNode } from "../../nodes/SSRNodes/YoutubeNode";
import { StepperNode } from "../../nodes/Stepper";
// import { ExcalidrawNode } from "../../nodes/SSRNodes/ExcalidrawNode";

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
	OverflowNode, // For handling overflow content
	HashtagNode, // For hashtags (optional, can be removed if not needed)
	MarkNode,
	MentionNode,
	TableNode,
	TableCellNode,
	TableRowNode,
	LayoutItemNode,
	CollapsibleContainerNode,
	CollapsibleContentNode,
	CollapsibleTitleNode,
	HintNode,
	HorizontalRuleNode,
	YouTubeNode,
	ImageNode,
	LayoutContainerNode,
	// ExcalidrawNode
];

export const commentNodes: LexicalNodeType[] = [
	HeadingNode,
	QuoteNode,
	ListNode,
	ListItemNode,
	LinkNode,
	CodeNode,
	CodeHighlightNode,
	AutoLinkNode, // For automatic link detection
	LinkNode, // For manual links
	OverflowNode, // For handling overflow content
	HashtagNode, // For hashtags (optional, can be removed if not needed)
	MarkNode,
	MentionNode,
];

const nodesToImplement = [
	//   StepperNode,
	// 	ImageNode,
	// ExcalidrawNode,
];
export default nodes;
