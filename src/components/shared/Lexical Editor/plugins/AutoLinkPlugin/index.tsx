import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import { TOGGLE_LINK_COMMAND_LinkWithMetaDataNode } from '../LinkWithMetaData';
import {  $getSelection, $isRangeSelection, } from 'lexical';
import { $isCodeHighlightNode } from "@lexical/code";

const URL_REGEX =
  /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)(?<![-.+():%])/;

export default function LexicalAutoLinkPlugin(): null {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const pastedText = event.clipboardData?.getData('text/plain');
      if (pastedText && URL_REGEX.test(pastedText)) {

        
        event.preventDefault();
        pastedText.split(" ").map((TEXT)=>{          
          if(URL_REGEX.test(TEXT)){
            editor.update(() => {
              const selection = $getSelection();
              if ($isRangeSelection(selection)) {
                 const node = selection.anchor.getNode();

                 
                 if(!$isCodeHighlightNode(node)){
                  if (node && node.getTextContent() === TEXT) {
                      node.remove();
                  }
                  
                  editor.dispatchCommand(TOGGLE_LINK_COMMAND_LinkWithMetaDataNode, TEXT);
                }
               
              }
            });
          }
        })
      
      }
    };

    const rootElement = editor.getRootElement();
    if (rootElement) {
      rootElement.addEventListener('paste', handlePaste);
    }

    return () => {
      if (rootElement) {
        rootElement.removeEventListener('paste', handlePaste);
      }
    };
  }, [editor]);

  return null; 
}