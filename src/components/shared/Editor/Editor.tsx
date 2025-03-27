"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic"; // Import dynamic from Next.js
import TextareaAutosize from "react-textarea-autosize";
import { z } from "zod";
import useFileUpload from "@/hooks/useFileUpload";
import { UNAUTHENTICATED } from "@/utils/contants";
import LoginModal from "@/components/auth/LoginModal";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import PostContentSkeleton from "./PostContentSkelton";
import { ContentType, EditorContent } from "@/utils/types";

// Dynamically import the Lexical Editor with SSR disabled
const Editor = dynamic(() => import("@/components/shared/Lexical Editor"), {
  ssr: false, // Disable server-side rendering for this component
});

interface EditorProps<T extends z.ZodType<EditorContent>> {
  onChange: (data: z.infer<T>) => void;
  answerHandler?: (data: z.infer<T>) => void;
  editorId?: string;
  defaultContent?: ContentType;
  showTitleField?: boolean;
  showCommandDetail?: boolean;
  titlePlaceHolder?: string;
  contentPlaceHolder?: string;
  postId: string;
  dataLoading?: boolean;
  answerPlaceHolder?: string;
}

export const LexicalEditorWrapper = <T extends z.ZodType<EditorContent>>({
  onChange,
  defaultContent = {},
  showTitleField = true,
  titlePlaceHolder = "Title",
  contentPlaceHolder = "Type here to write your post...",
  showCommandDetail = true,
  postId,
  dataLoading = false,
  answerHandler,
  answerPlaceHolder = "",
}: EditorProps<T>) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadError, setUploadError] = useState<string | null | undefined>(
    null
  );

  const editorPostId = `editor-post-${postId}`;
  const editorAnswerId = answerHandler ? `editor-answer-${postId}` : null;
  const _titleRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setIsMounted(true); // Set isMounted to true when the component mounts on the client
  }, []);

  // Initialize all editors when mounted and data is ready
  useEffect(() => {
    if (!isMounted || dataLoading) return;

    setIsLoading(false);
    setTimeout(() => _titleRef.current?.focus(), 0);
  }, [isMounted, dataLoading]);

  return (
    <>
      {uploadError === UNAUTHENTICATED && (
        <LoginModal
          closeHandler={() => setUploadError(null)}
          message="Sign in to upload an image."
        />
      )}

      <div className="pt-8 min-w-[73%] min-h-[70vh]">
        <div className="prose prose-stone dark:prose-invert flex flex-col w-full h-full justify-between ">
          <div className="h-full flex flex-col">
            {showTitleField &&
              (isLoading || dataLoading ? (
                <Skeleton className="h-10 w-52" />
              ) : (
                <TextareaAutosize
                  onChange={async () => {
                    const title = _titleRef.current?.value || "";
                    onChange({ title, blocks: [] }); // Pass empty blocks for now
                  }}
                  ref={_titleRef}
                  defaultValue={defaultContent?.post?.title ?? ""}
                  placeholder={titlePlaceHolder}
                  className={cn(
                    "w-full overflow-hidden text-lg md:text-xl lg:text-2xl font-bold bg-transparent appearance-none resize-none focus:outline-none"
                  )}
                />
              ))}

            {!dataLoading &&
              isMounted && ( // Render Lexical Editor only on the client
                <div id={editorPostId} className="mt-6">
                  <Editor
                    isEditable={true}
                    content={defaultContent.post?.blocks} // Pass initial content
                    placeholder={contentPlaceHolder}
                    id={editorPostId}
                    autoFocus={false}
                    onChange={(content) => {
                      const title = _titleRef.current?.value || "";
                      onChange({ title, blocks: content.blocks });
                    }}
                  />
                </div>
              )}

            {(isLoading || dataLoading) &&
              (dataLoading ? (
                <PostContentSkeleton
                  lines={10}
                  className="mt-6 mb-6 min-h-[250px]"
                />
              ) : (
                <Skeleton className="ml-6 mt-6 h-5 w-64 mb-[240px]" />
              ))}
          </div>

          {editorAnswerId && (
            <>
              <Separator className="py-0.5" />

              {isLoading || dataLoading ? (
                dataLoading ? (
                  <PostContentSkeleton
                    lines={9}
                    className="mt-8 min-h-[250px] mb-4"
                  />
                ) : (
                  <Skeleton className="ml-6 mt-6 h-5 w-64 mb-[240px]" />
                )
              ) : null}

              {!dataLoading &&
                isMounted && ( // Render Lexical Editor only on the client
                  <div id={editorAnswerId} className="mt-6">
                    <Editor
                      isEditable={true}
                      content={defaultContent.answer?.blocks} // Pass initial content
                      placeholder={answerPlaceHolder}
                      id={editorAnswerId}
                      autoFocus={false}
                      onChange={(content) => {
                        if (answerHandler) {
                          const title = _titleRef.current?.value || "";
                          answerHandler({ title, blocks: content.blocks });
                        }
                      }}
                    />
                  </div>
                )}
            </>
          )}

          {showCommandDetail &&
            (isLoading || dataLoading ? (
              <Skeleton className="px-1 h-6 py-2 w-64" />
            ) : (
              <p className="text-sm text-gray-500">
                Use{" "}
                <kbd className="px-1 text-xs uppercase border rounded-md bg-muted">
                  /
                </kbd>{" "}
                to open the command menu.
              </p>
            ))}
        </div>
      </div>
    </>
  );
};
