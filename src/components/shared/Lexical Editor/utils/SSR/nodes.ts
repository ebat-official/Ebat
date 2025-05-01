import type { Klass, LexicalNode, LexicalNodeReplacement } from "lexical";

import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListNode, ListItemNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { HorizontalRuleNode } from "../../nodes/SSRNodes/HorizontalRuleNode";
import { OverflowNode } from "@lexical/overflow";
import { HashtagNode } from "@lexical/hashtag";
import { MarkNode } from "@lexical/mark";
import { MentionNode } from "../../nodes/SSRNodes/MentionNode";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { BeautifulMentionNode } from "lexical-beautiful-mentions";
import { StepperNode } from "../../nodes/Stepper";
import { YouTubeNode } from "../../nodes/SSRNodes/YoutubeNode";
import { Hint } from "../../nodes/Hint";
import { ImageNode } from "../../nodes/SSRNodes/ImageNode";
import { LayoutItemNode } from "../../nodes/LayoutNode/LayoutItemNode";
import { CollapsibleContainerNode } from "../../nodes/CollapsibleNode/CollapsibleContainerNode";
import { CollapsibleContentNode } from "../../nodes/CollapsibleNode/CollapsibleContentNode";
import { CollapsibleTitleNode } from "../../nodes/CollapsibleNode/CollapsibleTitleNode";
import { HintNode } from "../../nodes/SSRNodes/HintNode";

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
];

const commentNodes: LexicalNodeType[] = [
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
