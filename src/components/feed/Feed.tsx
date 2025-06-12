"use client";
import React, { FC, useEffect, useRef, useCallback } from "react";
import { useFeedContext } from "./FeedContext";
import NoSearchResults from "./NoSearchResults";
import FeedSearch from "./FeedSearch";
import AddPostRoundButton from "./AddPostRoundButton";
import { FeedCard } from "./FeedCard";
import { FeedCardSkeleton } from "./FeedCardSkeleton";

export const Feed: FC = () => {
	const {
		accumulatedPosts: posts,
		isLoadingData,
		setPage,
		pageSize,
		context: { hasMorePage, page },
	} = useFeedContext();
	const observerRef = useRef<HTMLDivElement | null>(null);

	const handleObserver = useCallback(
		(entries: IntersectionObserverEntry[]) => {
			const [entry] = entries;

			if (entry.isIntersecting && hasMorePage && !isLoadingData) {
				setPage((prev) => prev + 1);
			}
		},
		[hasMorePage, isLoadingData, setPage],
	);

	useEffect(() => {
		const observer = new IntersectionObserver(handleObserver, {
			root: null,
			rootMargin: "300px",
			threshold: 1.0,
		});
		const currentRef = observerRef.current;
		if (currentRef) observer.observe(currentRef);

		return () => {
			if (currentRef) observer.unobserve(currentRef);
		};
	}, [handleObserver]);

	return (
		<div className="flex bg-bac flex-col gap-16 mt-16 container m-auto p-2 sm:p-4 md:p-8">
			<div className="flex gap-2 justify-between items-center w-full lg:w-1/2 px-4 m-auto">
				<FeedSearch />
				<AddPostRoundButton />
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
				{posts.map((post) => (
					<FeedCard key={post.id} post={post} />
				))}
				{isLoadingData &&
					Array.from({ length: pageSize }).map((_, i) => (
						<FeedCardSkeleton key={i} />
					))}
			</div>
			{hasMorePage && <div ref={observerRef} className="h-8" />}
			{!isLoadingData && posts.length === 0 && (
				<NoSearchResults category="Post" />
			)}
		</div>
	);
};
