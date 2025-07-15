import type { Klass, LexicalNode } from "lexical";

import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { HashtagNode } from "@lexical/hashtag";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { MarkNode } from "@lexical/mark";
import { OverflowNode } from "@lexical/overflow";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { YouTubeNode } from "../plugins/YouTubeNode";
import { CollapsibleContainerNode } from "./CollapsibleNode/CollapsibleContainerNode";
import { CollapsibleContentNode } from "./CollapsibleNode/CollapsibleContentNode";
import { CollapsibleTitleNode } from "./CollapsibleNode/CollapsibleTitleNode";
import { ExcalidrawNode } from "./ExcalidrawNode";
import { Hint } from "./Hint";
import { ImageNode } from "./ImageNode";
import { LayoutContainerNode } from "./LayoutNode/LayoutContainerNode";
import { LayoutItemNode } from "./LayoutNode/LayoutItemNode";
import { StepperNode } from "./Stepper";

const nodes: Array<Klass<LexicalNode>> = [
	HeadingNode,
	ListNode,
	ListItemNode,
	QuoteNode,
	CodeNode,
	TableNode,
	TableCellNode,
	TableRowNode,
	CodeHighlightNode,
	StepperNode,
	AutoLinkNode,
	YouTubeNode,
	Hint,
	LinkNode,
	OverflowNode,
	HorizontalRuleNode,
	MarkNode,
	ImageNode,
	LayoutItemNode,
	LayoutContainerNode,
	CollapsibleContainerNode,
	CollapsibleContentNode,
	CollapsibleTitleNode,
	ExcalidrawNode,
];

export const nestedNodes: Array<Klass<LexicalNode>> = [
	HeadingNode,
	ListNode,
	ListItemNode,
	LinkNode,
	CodeHighlightNode,
	QuoteNode,
	CodeNode,
	StepperNode,
	ImageNode,
];
export default nodes;
