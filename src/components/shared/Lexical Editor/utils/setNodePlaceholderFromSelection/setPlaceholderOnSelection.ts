import { LexicalEditor, PointType, RangeSelection } from 'lexical';
import { getAllLexicalChildren } from '../getAllLexicalChildren';
import { getNodePlaceholder } from './getNodePlaceholder';

import './styles.css';
import { $isCollapsibleContainerNode } from '../../nodes/CollapsibleNode/CollapsibleContainerNode';
import { $isCollapsibleContentNode } from '../../nodes/CollapsibleNode/CollapsibleContentNode';

const PLACEHOLDER_CLASS_NAME = 'node-placeholder';

const isHtmlHeadingElement = (el: HTMLElement): el is HTMLHeadingElement => {
   return el instanceof HTMLHeadingElement;
};

export const setPlaceholderOnSelection = ({
   selection,
   editor,
}: {
   selection: RangeSelection;
   editor: LexicalEditor;
}): void => {
   /**
    * 1. Get all lexical nodes as HTML elements
    */
   const children = getAllLexicalChildren(editor);
   
   
   /**
    * 2. Remove "placeholder" class if it was added before
    */
   const removePlaceholderClass = (element: HTMLElement) => {
      if (!element) return;
   
      // Remove the placeholder class from the current element
      if (element.classList.contains(PLACEHOLDER_CLASS_NAME)) {
         element.classList.remove(PLACEHOLDER_CLASS_NAME);
         element.removeAttribute('data-placeholder');
      }
   
      // Recursively process child elements
      Array.from(element.children).forEach(child => {
         if (child instanceof HTMLElement) {
            removePlaceholderClass(child);
         }
      });
   };
   
   children.forEach(({ htmlElement,node  }:any) => {
      if (!htmlElement) {
         return;
      }

      if (isHtmlHeadingElement(htmlElement)) {         
         return;
      }
    
      
      
      const classList = htmlElement.classList;
      if (node.__type === 'collapsible-container') {
         removePlaceholderClass(htmlElement);
         return;
      }
      if (node.__type === 'table') {
         removePlaceholderClass(htmlElement);
         return;
      }
      if(node.__type==="layout-container"){
         removePlaceholderClass(htmlElement);
      }
      if (classList.length && classList.contains(PLACEHOLDER_CLASS_NAME)) {         
         classList.remove(PLACEHOLDER_CLASS_NAME);
         htmlElement.removeAttribute('data-placeholder');

      }
   });

   /**
    * 3. Do nothing if there is only one lexical child,
    *  because we already have a placeholder
    *  in <RichTextPlugin/> component
    *  With on exception: If we converted default node to the "Heading"
    */
   if (
      children.length === 1 &&
      children[0].htmlElement &&
      !isHtmlHeadingElement(children[0].htmlElement) 
   ) {
      return;
   }

   /**
    * 4. Get "PointType" object, that contain Nodes data
    * (that is selected)
    * {
    *    key: "5", <- Node's key
    *    offset: 7,
    *    type: "text"
    * }
    */
   const anchor: PointType = selection.anchor;

   /**
    * 5. Get placeholder for type ('heading'/'paragraph'/etc...)
    */
   const placeholder = getNodePlaceholder(anchor.getNode());

   if (placeholder) {
      const selectedHtmlElement = editor.getElementByKey(anchor.key);
      
      selectedHtmlElement?.classList.add(PLACEHOLDER_CLASS_NAME);
      selectedHtmlElement?.setAttribute('data-placeholder', placeholder);
   }
};