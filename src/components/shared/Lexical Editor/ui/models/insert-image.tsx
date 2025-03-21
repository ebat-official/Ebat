import { JSX, useEffect, useRef } from "react";
import { INSERT_IMAGE_COMMAND, InsertImagePayload } from "../../plugins/ImagesPlugin";
import FileUploadZone from "../image/file-upload";
import { LexicalEditor } from "lexical";

export function InsertImageDialog({
  activeEditor,
  onClose,
}: {
  activeEditor: LexicalEditor;
  onClose: () => void;
}): JSX.Element {
  const hasModifier = useRef(false);

  useEffect(() => {
    hasModifier.current = false;
    const handler = (e: KeyboardEvent) => {
      hasModifier.current = e.altKey;
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, [activeEditor]);


  const handleInsertImage = (payload: InsertImagePayload) => {
    activeEditor.dispatchCommand(INSERT_IMAGE_COMMAND, payload);
  };

  const InsertMedia = (files?: {url:string,alt:string}[]) => {
  
    if (!files) {
      return;
    }
    for (let index = 0; index < files.length; index++) {
      console.log(files);
      
      const payload: InsertImagePayload = {
        altText: files[index].alt || "image",
        src:  files[index].url ,
      };
      handleInsertImage(payload);
      
      if (index === files.length - 1) {
        onClose();
      }

    }
  }
  return <FileUploadZone InsertMedia={InsertMedia}/>;
}