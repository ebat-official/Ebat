import { Difficulty } from '@prisma/client';
"use server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { formSchema, formSchemaType } from "@/lib/validators/form";
import { PostDraftValidatorUI } from "@/lib/validators/post";
import { UserNotAuthenticatedErr } from "@/utils/errors";
import { z } from "zod";


const currentUser = async () => {
  const session = await auth();
  return session?.user;
};

export async function CreateDraftPost(data: z.infer<typeof PostDraftValidatorUI>) {
    // Validate incoming data
    const validation = PostDraftValidatorUI.safeParse(data);
    if (!validation.success) {
      throw new Error("Draft post data is not valid");
    }
  
    const user = await currentUser();
    if (!user) {
      throw UserNotAuthenticatedErr();
    }
  
    const { id, title, content, type, difficulty, companies, completionDuration, topics, category, subCategory } = data;
  
    // Check existing post ownership if updating
    if (id) {
      const existingPost = await prisma.post.findUnique({
        where: { id },
        select: { authorId: true }
      });
  
      if (existingPost && existingPost.authorId !== user.id) {
        throw UserNotAuthenticatedErr();
      }
    }
  
    // Perform upsert with explicit field mapping
    const draftPost = await prisma.post.upsert({
      where: { 
        id: id 
      },
      create: {
        id,
        authorId: user.id,
        title: title || null,
        content: content,
        type: type,
        difficulty: data.difficulty as Difficulty,
        companies: companies || [],
        completionDuration: completionDuration || null,
        topics: topics || [],
        category: category,
        subCategory: subCategory,
        status: "DRAFT"
      },
      update: {
        title: title || null,
        content: content ,
        type: type,
        difficulty: difficulty || null,
        companies: companies || [],
        completionDuration: completionDuration || null,
        topics: topics || [],
        category: category,
        subCategory: subCategory,
        status: "DRAFT",
      }
    });
  
    if (!draftPost) {
      throw new Error("Something went wrong while saving the draft");
    }
  
    return draftPost.id;
  }