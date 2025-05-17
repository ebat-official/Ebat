"use client";
import React, { FC } from "react";
import { useFeedContext } from "./FeedContext";

interface FeedProps {}

const Feed: FC<FeedProps> = ({}) => {
	const { posts, isLoading, refetch } = useFeedContext();
	console.log(posts, isLoading, refetch, "helloo");
	return <div>Feed</div>;
};

export default Feed;
