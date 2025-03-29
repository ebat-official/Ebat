import { $createCodeNode } from "@lexical/code";
import {
  $createParagraphNode,
  $createRangeSelection,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  createEditor,
  ElementNode,
  LexicalEditor,
  LexicalNode,
  TextNode,
} from "lexical";
import {
  $createHeadingNode,} from '@lexical/rich-text';
import { $createStepperNode, StepsType } from "../nodes/Stepper";

function getWordsBeforeSelection(
  editor: LexicalEditor,
  numWords: number
): string {
  let wordsBeforeSelection = "";

  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) {
      console.warn("No valid text selection found.");
      return;
    }

    const anchor = selection.anchor;
    const firstTextNode = findFirstTextNode($getRoot());

    if (!firstTextNode) {
      console.warn("No text nodes found in the document.");
      return;
    }

    // Create a range from the first text node start to the selection anchor
    const range = $createRangeSelection();
    range.anchor.set(firstTextNode.__key, 0, 'text');
    range.focus.set(anchor.key, anchor.offset, anchor.type);

    const textContent = range.getTextContent();
    const words = textContent.split(/\s+/).filter(word => word.length > 0);

    const startIndex = Math.max(0, words.length - numWords);
    wordsBeforeSelection = words.slice(startIndex, words.length).join(" ");
  });

  return wordsBeforeSelection;
}

// Helper function to find the first text node in document order
function findFirstTextNode(node: LexicalNode): TextNode | null {
  if ($isTextNode(node)) {
    return node;
  }

  const children = (node as ElementNode).getChildren();
  for (const child of children) {
    const result = findFirstTextNode(child);
    if (result) {
      return result;
    }
  }

  return null;
}


function isJSON(text: string): boolean {
  try {
    JSON.parse(text);
    return true;
  } catch (err) {
    return false;
  }
}
function createEditorWithText(text: string): LexicalEditor {
  const editor = createEditor();
  const editorState = editor.parseEditorState(
    JSON.stringify({
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: text,
                type: "text",
                version: 1,
              },
            ],
            direction: null,
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
            textFormat: 0,
            textStyle: "",
          },
        ],
        direction: null,
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    })
  );
  editor.setEditorState(editorState);
  return editor;
}

function GenerateSteps(json:string, editor: LexicalEditor){
  const stepsData = JSON.parse(json);
  const steps: StepsType = stepsData.map((step: { id: number; title: string; content: string }) => {
    return {
      id: step.id,
      title: step.title,
      content: createEditorWithText(step.content),
    };
  });    
  editor.update(()=>{
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const stepperNode = $createStepperNode(steps);
      selection.insertNodes([stepperNode]);
    }
    return
  })
}

// getMore = number of words to get if the selection was less than 30 len.
const getSelectedText = (editor: LexicalEditor,getMore?:number) => {
  let selectedText = "";
  let context = getMore?getWordsBeforeSelection(editor, getMore):null
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const selectionText = selection.getTextContent();      
      if (selectionText.length > 30) {
        selectedText = selectionText; 
      } else {
        selectedText = context+selectionText ;
      }
    }
  });

  return selectedText;
};


function applyStyles(AIString: string) {
  // Regex now matches:
  // 1. Code blocks delimited by triple backticks (```...```)
  // 2. Bold text delimited by ** (e.g., **bold**)
  // 3. Inline code delimited by a single backtick (e.g., `some code`)
  // 4. Headers starting with ### (e.g., ### Header)
  const pattern = /(```[\s\S]*?```)|(\*\*[\s\S]+?\*\*)|(`[\s\S]+?`)|(###\s+[\s\S]+?(?=\n|$))/g;
  let lastIndex = 0;
  const nodes = [];

  // Process all matches of code, bold, or inline code segments.
  AIString.replace(
    pattern,
    (match, codeBlockMatch, boldMatch, codeMatch,headerMatch, offset) => {
      // Append any plain text before the matched segment.
      if (offset > lastIndex) {
        const plainText = AIString.slice(lastIndex, offset);
        nodes.push($createTextNode(plainText));
      }
      if (codeBlockMatch) {
        // TODO: extract the code lang and apply it to the code block.

        const content = codeBlockMatch.slice(3, -3);
        const codeNode = $createCodeNode();
        codeNode.append($createTextNode(content));
        nodes.push(codeNode);
      } else if (boldMatch) {
        // Found bold text. Remove the leading and trailing "**".
        const content = boldMatch.slice(2, -2);
        const boldTextNode = $createTextNode(content);
        boldTextNode.setFormat("bold");
        nodes.push(boldTextNode);
      } else if (codeMatch) {
        const content = codeMatch.slice(1, -1);
        const codeTextNode = $createTextNode(content);
        codeTextNode.setFormat("code");
        nodes.push(codeTextNode);
      }else if(headerMatch){
         const content = headerMatch.slice(4).trim(); 
         const headerNode = $createHeadingNode("h3"); 
         headerNode.append($createTextNode(content));
         nodes.push(headerNode);
      }
      lastIndex = offset + match.length;
      return match;
    }
  );

  // Append any remaining plain text after the last match.
  if (lastIndex < AIString.length) {
    nodes.push($createTextNode(AIString.slice(lastIndex)));
  }

  return nodes;
}


function insertText(text: string, editor: LexicalEditor) {
  if(isJSON(text) || text.startsWith("json")){
    GenerateSteps(text,editor)
    return
  }
  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection))
      return console.log("No valid text selection found.");

    const nodesInSelection = selection.getNodes();
    if (nodesInSelection.length > 0) {
      let insertionPoint = nodesInSelection[nodesInSelection.length - 1];
      const formattedNodes = applyStyles(text);

      formattedNodes.forEach((node: any) => {
        insertionPoint.insertAfter(node);
        insertionPoint = node;
      });
    }
  });
}

function replaceSelectedText(text: string, editor: LexicalEditor) {
  
  if(isJSON(text) || text.startsWith("json")){
    GenerateSteps(text,editor)
    return
  }

  
  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) {
      console.warn("No valid text selection found.");
      return;
    }
    selection.removeText();
    const formattedNodes = applyStyles(text);
    selection.insertNodes(formattedNodes);
  });
}


function insertTextUnderSelected(text: string, editor: LexicalEditor) {
  if(isJSON(text) || text.startsWith("json")){
    GenerateSteps(text,editor)
    return
  }
  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;

    const nodes = selection.getNodes();
    if (nodes.length > 0) {
      const lastNode = nodes[nodes.length - 1];

      const newParagraph = $createParagraphNode();

      const formattedNodes = applyStyles(text);

      newParagraph.append(...formattedNodes);

      lastNode.insertAfter(newParagraph);
    }
  });
}

export {
  replaceSelectedText,
  insertTextUnderSelected,
  getSelectedText,
  insertText,
  getWordsBeforeSelection,
};
