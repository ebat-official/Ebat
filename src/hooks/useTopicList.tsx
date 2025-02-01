// hooks/useTopics.ts
import { useState, useEffect, useCallback } from "react";
import topicsData from "@/utils/TopicListConfig";

type TopicCategory = "javascript"; // Add more categories as needed

const useTopics = (category: TopicCategory) => {
	// Use the raw data directly from topicsData based on the category
	const [topics, setTopics] = useState<string[]>(topicsData[category] || []);

	useEffect(() => {
		// Reset to original list when category changes
		setTopics(topicsData[category] || []);
	}, [category]);

	// Memoizing the search function for better performance on repeated renders
	const searchedTopics = useCallback(
		(query: string): string[] => {
			if (!topics) return topicsData[category];
			// Filtering topics based on the search query (case-insensitive)
			return topics.filter((topic) =>
				topic.toLowerCase().includes(query.toLowerCase()),
			);
		},
		[topicsData],
	);

	const searchTopics = (query: string) => {
		setTopics(searchedTopics(query));
	};

	return { topics, searchTopics };
};

export default useTopics;
