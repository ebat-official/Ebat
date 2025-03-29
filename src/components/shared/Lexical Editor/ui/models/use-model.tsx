"use client";

import { useCallback, useMemo, useState,JSX } from "react";
import {
  Dialog,
  DialogDescription,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "./custom-dialog";

export default function useModal(): [
  JSX.Element | null,
  (
    title?: string | null, 
    description?: string | null, 
    getContent?: (onClose: () => void) => JSX.Element,
    isDilog?:boolean

  ) => void,
  boolean
] {
  const [isOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{
    title?: string | null;
    description?: string | null;
    content?: JSX.Element;
    isDilog?:boolean
  } | null>(null);

  const onClose = useCallback(() => {
    setIsOpen(false);
    setModalContent(null);
  }, []);

  const showModal = useCallback(
    (
      title?: string | null,
      description?: string | null,
      getContent?: (onClose: () => void) => JSX.Element,
      isDilog?:boolean

    ) => {
      setIsOpen(true);
      setModalContent({
        title,
        description,
        content: getContent ? getContent(onClose) : undefined,
        isDilog:isDilog
      });
    },
    [onClose]
  );

  const modal = useMemo(() => {
    if (!isOpen || !modalContent) {
      return null;
    }


    const { title, description, content,isDilog } = modalContent;
    if(!isDilog){
      return <>{content}</>
    }
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-full max-w-md bg-white p-6 dark:bg-zinc-900">
          {(title || description) && (
            <DialogHeader>
              {title && (
                <DialogTitle className="text-zinc-900 dark:text-white">
                  {title}
                </DialogTitle>
              )}
              {description && (
                <DialogDescription className="text-zinc-600 dark:text-zinc-400">
                  {description}
                </DialogDescription>
              )}
            </DialogHeader>
          )}
          <div className="mt-2">{content}</div>
          <DialogClose />
        </DialogContent>
      </Dialog>
    );
  }, [isOpen, modalContent]);

  return [modal, showModal, isOpen]; 
}