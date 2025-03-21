import { $getRoot, ElementNode, LexicalEditor, ParagraphNode, TextNode } from "lexical";
import {ListItemNode, ListNode} from "@lexical/list"
import {HeadingNode,QuoteNode} from "@lexical/rich-text"
import {TableNode} from "@lexical/table"
import {CodeNode} from "@lexical/code"
import { CollapsibleContainerNode } from "../nodes/CollapsibleNode/CollapsibleContainerNode";
import { CollapsibleTitleNode } from "../nodes/CollapsibleNode/CollapsibleTitleNode";
export  type BlockType = "Table"|'heading'|"CollapsibleContent" | 'paragraph' |"Collapsible"| 'text' | 'list' | 'list-item' | 'quote' | 'code' | "Hint"

export type ExtractedBlock = {
  blockType: BlockType;
  content: string;
  children?: ExtractedBlock[];
}

function extractChildrenContent(nodes: any[]): string {
  return nodes
    .filter(node => node instanceof TextNode)
    .map(node => node.getTextContent())
    .join(' ');
}

function processListItem(listItem: ListItemNode): ExtractedBlock {
  let textContent = '';
  const children: ExtractedBlock[] = [];

  listItem.getChildren().forEach(child => {
    if (child instanceof TextNode) {
      textContent += child.getTextContent();
    } else if (child instanceof ElementNode) {
      textContent += extractChildrenContent(child.getChildren());
    }
    
    if (child instanceof ListNode) {
      children.push(...processList(child));
    }
  });

  return {
    blockType: 'list-item',
    content: textContent.trim(),
    children: children.length > 0 ? children : undefined
  };
}

function processList(listNode: ListNode): ExtractedBlock[] {
  const listType = listNode.getListType();
  return listNode.getChildren().map(child => ({
    ...processListItem(child as ListItemNode),
    attributes: { listType }
  }));
}

function processHeading(headingNode: HeadingNode): ExtractedBlock {
  return {
    blockType: 'heading',
    content: headingNode.getTextContent(),
  };
}
// should i make better json?
function processTable(TableNode:TableNode): ExtractedBlock {
    return {
      blockType: 'Table',
      content: TableNode.getTextContent(),
    };
}
function processCodeBlock(codeNode: CodeNode): ExtractedBlock {
  return {
    blockType: 'code',
    content: codeNode.getTextContent(),
  };
}

export function ExtractData(editor: LexicalEditor):string {
  const blocks: ExtractedBlock[] = [];

  editor.update(() => {
    const root = $getRoot();
    
    root.getChildren().forEach(node => {
      try {
    
        if (node instanceof HeadingNode) {
          blocks.push(processHeading(node));
        } 
        else if(node instanceof TableNode){          
          blocks.push(processTable(node));
        }
        
        else if (node instanceof ListNode) {
          blocks.push({
            blockType: 'list',
            content: '',
            children: processList(node)
          });
        }
        else if (node instanceof CollapsibleContainerNode || node instanceof CollapsibleTitleNode) {
            let title = "";
            let content = "";
          
            if (node instanceof CollapsibleTitleNode) {
              title = node.getTextContent();
            }
          
            if (node instanceof CollapsibleContainerNode) {
              const children = node.getChildren();
              const titleNode = children.find(child => child instanceof CollapsibleTitleNode);
              if (titleNode) {
                title = titleNode.getTextContent();
              }
              content = children
                .filter(child => !(child instanceof CollapsibleTitleNode))
                .map(child => child.getTextContent())
                .join("\n");
            }
        
          
            blocks.push({
              blockType: "Collapsible",
              content: title, // The collapsible title.
              children: [
                {
                  blockType: "CollapsibleContent",
                  content: content, // The collapsible content.
                },
              ],
            });
        }  
        else if (node instanceof ParagraphNode) {
          if(node.getTextContent() == "") return;
          blocks.push({
            blockType: 'paragraph',
            content: node.getTextContent()
          });
        }
        else if (node instanceof CodeNode) {
          blocks.push(processCodeBlock(node));
        }
        else if (node instanceof QuoteNode) {
          
          blocks.push({
            blockType: 'quote',
            content: node.getTextContent(),
            children: node.getChildren().length>=2 ?node.getChildren().map(child => ({
              blockType: 'text',
              content: child.getTextContent()
            })):undefined
          });
        }
        else if (node instanceof TextNode) {
          blocks.push({
            blockType: 'text',
            content: node.getTextContent()
          });
        }
       
      } catch (error) {
        console.warn('Error processing node:', error);
      }
    });
  });


  
  return JSON.stringify(blocks);
}