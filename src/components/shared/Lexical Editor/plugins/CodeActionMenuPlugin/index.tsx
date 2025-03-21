import {
  $isCodeNode,
  CodeNode,
  getLanguageFriendlyName,
  normalizeCodeLang,
} from "@lexical/code";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getNearestNodeFromDOMNode,
  $getNodeByKey,
  isHTMLElement,
  NodeKey,
} from "lexical";
import { useEffect, useRef, useState } from "react";
import * as React from "react";
import { createPortal } from "react-dom";

import { CopyButton } from "./components/CopyButton";
import { canBePrettier, PrettierButton } from "./components/PrettierButton";
import { useDebounce } from "./utils";
import CodeList from "../../ui/drop-downs/code";

const CODE_PADDING = 8;

interface Position {
  top: string;
  right: string;
}

function CodeActionMenuContainer({
  anchorElem,
}: {
  anchorElem: HTMLElement;
}): React.JSX.Element {
  const [editor] = useLexicalComposerContext();

  const [lang, setLang] = useState("");
  const [isShown, setShown] = useState<boolean>(false);
  const [selectedElementKey, setSelectedElementKey] = useState<NodeKey | null>(
    null
  );
  const [shouldListenMouseMove, setShouldListenMouseMove] =
    useState<boolean>(false);
  const [position, setPosition] = useState<Position>({
    right: "0",
    top: "0",
  });
  const codeSetRef = useRef<Set<string>>(new Set());
  const codeDOMNodeRef = useRef<HTMLElement | null>(null);

  function getCodeDOMNode(): HTMLElement | null {
    return codeDOMNodeRef.current;
  }

  const debouncedOnMouseMove = useDebounce(
    (event: MouseEvent) => {
      const { codeDOMNode, isOutside } = getMouseInfo(event);
      if (isOutside) {
        setShown(false);
        return;
      }

      if (!codeDOMNode) {
        return;
      }

      codeDOMNodeRef.current = codeDOMNode;

      let codeNode: CodeNode | null = null;
      let _lang = "";

      editor.update(() => {
        const maybeCodeNode = $getNearestNodeFromDOMNode(codeDOMNode);

        if ($isCodeNode(maybeCodeNode)) {
          codeNode = maybeCodeNode;
          _lang = codeNode.getLanguage() || "";
          setSelectedElementKey(codeNode.getKey()); // Set the selectedElementKey
        }
      });

      if (codeNode) {
        const { y: editorElemY, right: editorElemRight } =
          anchorElem.getBoundingClientRect();
        const { y, right } = codeDOMNode.getBoundingClientRect();
        setLang(_lang);
        setShown(true);
        setPosition({
          right: `${editorElemRight - right  + CODE_PADDING}px`,
          top: `${y - editorElemY}px`,
        });
      }
    },
    1000,
    500
  );

  useEffect(() => {
    if (!shouldListenMouseMove) {
      return;
    }

    document.addEventListener("mousemove", debouncedOnMouseMove);

    return () => {
      setShown(false);
      debouncedOnMouseMove.cancel();
      document.removeEventListener("mousemove", debouncedOnMouseMove);
    };
  }, [shouldListenMouseMove, debouncedOnMouseMove]);

  useEffect(() => {
    return editor.registerMutationListener(
      CodeNode,
      (mutations) => {
        editor.getEditorState().read(() => {
          for (const [key, type] of mutations) {
            switch (type) {
              case "created":
                codeSetRef.current.add(key);
                break;

              case "destroyed":
                codeSetRef.current.delete(key);
                break;

              default:
                break;
            }
          }
        });
        setShouldListenMouseMove(codeSetRef.current.size > 0);
      },
      { skipInitialization: false }
    );
  }, [editor]);

  const normalizedLang = normalizeCodeLang(lang);
  const codeFriendlyName = getLanguageFriendlyName(lang);

  const onCodeLanguageSelect = React.useCallback(
    (value: string) => {
      editor.update(() => {
        if (selectedElementKey !== null) {
          const node = $getNodeByKey(selectedElementKey);
          if ($isCodeNode(node)) {
            node.setLanguage(value);
            setLang(value);
          }
        }
      });
    },
    [editor, selectedElementKey]
  );

  
  return (
    <div>
      {isShown ? (
        <div
          className="code-action-menu-container   flex flex-row items-center gap-x-2 p-2 absolute "
          style={{ ...position }}
        >
          <div>
            <CodeList
              codeLanguage={codeFriendlyName}
              disabled={!editor.isEditable()}
              onCodeLanguageSelect={onCodeLanguageSelect}
            />
          </div>
          <CopyButton editor={editor} getCodeDOMNode={getCodeDOMNode} />
          {canBePrettier(normalizedLang) ? (
            <PrettierButton
              editor={editor}
              getCodeDOMNode={getCodeDOMNode}
              lang={normalizedLang}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function getMouseInfo(event: MouseEvent): {
  codeDOMNode: HTMLElement | null;
  isOutside: boolean;
} {
  const target = event.target;

  if (isHTMLElement(target)) {
    const codeDOMNode = target.closest<HTMLElement>(
      "code.line-code"
    );
    const isOutside = !(
      codeDOMNode ||
      target.closest<HTMLElement>("div.code-action-menu-container") ||
      target.closest<HTMLElement>("div.code-selector") ||
      target.closest<HTMLElement>("code.line-code")
    );

    return { codeDOMNode, isOutside };
  } else {
    return { codeDOMNode: null, isOutside: true };
  }
}

export default function CodeActionMenuPlugin({
  anchorElem = document.body,
}: {
  anchorElem?: HTMLElement;
}): React.ReactPortal | null {
  return createPortal(
    <CodeActionMenuContainer anchorElem={anchorElem} />,
    anchorElem
  );
}
