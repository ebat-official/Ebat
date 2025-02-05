import { OutputData } from "@editorjs/editorjs";

export interface EditorContent extends OutputData {
    title?: string;
}

export interface ContentType  {
    post?: EditorContent;
    answer?: EditorContent;
}

export type PrismaJson = ReturnType<typeof JSON.parse> | null | undefined;