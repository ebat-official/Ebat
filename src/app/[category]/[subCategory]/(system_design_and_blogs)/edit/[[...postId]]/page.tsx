"use client";

import React from "react";
import { useParams, notFound } from "next/navigation";
import isValidCategory from "@/utils/isValidCategory";
import { POST_ACTIONS } from "@/utils/contants";
import { PostType } from "@/db/schema/enums";
import PostCreateEdit from "@/components/post edit/PostCreateEdit";

function Page() {
	const {
		category: categoryRoute,
		subCategory: subCategoryRoute,
		postId: postIdParam,
	} = useParams();

	const category = (
		Array.isArray(categoryRoute) ? categoryRoute[0] : categoryRoute
	)?.toUpperCase();
	const postType = (
		Array.isArray(subCategoryRoute) ? subCategoryRoute[0] : subCategoryRoute
	)?.toUpperCase();

	const postId = Array.isArray(postIdParam) ? postIdParam[0] : postIdParam;

	// Validate dynamic parameters
	if (
		!category ||
		!postType ||
		!(postType === PostType.BLOGS || postType === PostType.SYSTEMDESIGN) ||
		!isValidCategory(category)
	) {
		notFound();
	}

	return (
		<PostCreateEdit
			category={category}
			subCategory={postType}
			postId={postId}
			action={POST_ACTIONS.EDIT}
			postType={postType}
		/>
	);
}

export default Page;
