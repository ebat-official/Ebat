"use client";

import React from "react";
import { useParams, notFound } from "next/navigation";
import isValidCategory from "@/utils/isValidCategory";
import isValidSubCategory from "@/utils/isValidSubCategory";
import { POST_ACTIONS } from "@/utils/contants";
import PostCreateEdit from "@/components/post edit/PostCreateEdit";
import { PostType } from "@/db/schema/enums";

function Page() {
	const {
		category: categoryRoute,
		subCategory: subCategoryRoute,
		postId: postIdParam,
	} = useParams();

	const subCategory = (
		Array.isArray(subCategoryRoute) ? subCategoryRoute[0] : subCategoryRoute
	)?.toLowerCase();
	const category = (
		Array.isArray(categoryRoute) ? categoryRoute[0] : categoryRoute
	)?.toLowerCase();

	const postId = Array.isArray(postIdParam) ? postIdParam[0] : postIdParam;

	// Validate dynamic parameters
	if (
		!category ||
		!subCategory ||
		!isValidSubCategory(subCategory) ||
		!isValidCategory(category)
	) {
		notFound();
	}

	return (
		<PostCreateEdit
			category={category}
			subCategory={subCategory}
			postId={postId}
			action={POST_ACTIONS.CREATE}
			postType={PostType.CHALLENGE}
		/>
	);
}

export default Page;
