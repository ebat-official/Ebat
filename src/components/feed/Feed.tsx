"use client";
import React, { FC } from "react";
import { useFeedContext } from "./FeedContext";
import { Card, CardContent } from "@/components/ui/card";
import { DifficultyBadge } from "../shared/DifficultyBadge";
import { FiCheckCircle } from "react-icons/fi";
import { cn } from "@/lib/utils";
import { ViewsBadge } from "../shared/viewsBadge";
import { FeedPost } from "@/utils/types";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { FeedPagination } from "./FeedPagination";
import { QuestionSkeleton } from "./QuestionSkelton";
import { Difficulty } from "@prisma/client";
import NoSearchResults from "./NoSearchResults";
import FeedSearch from "./FeedSearch";
import AddPostRoundButton from "./AddPostRoundButton";
import { FeedCard } from "./FeedCard";

export const Feed: FC = () => {
	const { posts, isLoadingData, completionStatuses, context, pageSize } =
		useFeedContext();
	const pathname = usePathname();

	const getUrl = (post: FeedPost) => `${pathname}/${post.slug}-${post.id}`;

	return (
		<div className="flex flex-col gap-16 mt-16 container m-auto p-8">
			<div className="flex gap-2 justify-between items-center w-full lg:w-1/2 px-4 m-auto">
				<FeedSearch />
				<AddPostRoundButton />
			</div>
			{isLoadingData ? (
				<div className="flex flex-col gap-4">
					{Array.from({ length: pageSize }).map((_, i) => (
						<QuestionSkeleton key={i} />
					))}
				</div>
			) : posts.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
					{posts.map((post) => (
						<FeedCard key={post.id} post={post} />
					))}
					<FeedPagination />
				</div>
			) : (
				<NoSearchResults category="Posts" />
			)}
		</div>
	);
};
