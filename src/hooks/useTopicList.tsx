import { useState, useEffect, useCallback } from "react";
import topicsData from "@/utils/subCategoryConfig";
import { TopicCategory } from "@/utils/types";

const useTopics = (category: TopicCategory) => {
	if (!category) return { topics: [], searchTopics };
	// Use the raw data directly from topicsData based on the category
	const [topics, setTopics] = useState<string[]>(topicsData[category] || []);

	useEffect(() => {
		// Reset to original list when category changes
		setTopics(topicsData[category] || []);
	}, [category]);

	const searchedTopics = useCallback(
		(query: string): string[] => {
			if (!topics) return topicsData[category];
			return topics.filter((topic) =>
				topic.toLowerCase().includes(query.toLowerCase()),
			);
		},
		[topics, category],
	);

	function searchTopics(query: string) {
		setTopics(searchedTopics(query));
	}

	return { topics, searchTopics };
};

export default useTopics;
