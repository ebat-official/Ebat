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
import { ImageNode } from "./ImageNode";
import { PollNode } from "./PollNode";
import { LayoutItemNode } from "./LayoutNode/LayoutItemNode";
import { LayoutContainerNode } from "./LayoutNode/LayoutContainerNode";
import { CollapsibleContainerNode } from "./CollapsibleNode/CollapsibleContainerNode";
import { CollapsibleContentNode } from "./CollapsibleNode/CollapsibleContentNode";
import { CollapsibleTitleNode } from "./CollapsibleNode/CollapsibleTitleNode";
import { LinkWithMetaDataNode } from "../plugins/LinkWithMetaData";
import { TweetNode } from "./TweetNode";
import { YouTubeNode } from "../plugins/YouTubeNode";
import { Hint } from "./Hint";
import { StepperNode } from "./Stepper";
import { ExcalidrawNode } from "./ExcalidrawNode";
import { EquationNode } from "./EquationNode/EquationNode";

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
	TweetNode,
	LinkNode,
	OverflowNode,
	HorizontalRuleNode,
	MarkNode,
	ImageNode,
	PollNode,
	LayoutItemNode,
	LayoutContainerNode,
	CollapsibleContainerNode,
	CollapsibleContentNode,
	CollapsibleTitleNode,
	LinkWithMetaDataNode,
	ExcalidrawNode,
	EquationNode,
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
	LinkWithMetaDataNode,
	ImageNode,
];
export default nodes;
