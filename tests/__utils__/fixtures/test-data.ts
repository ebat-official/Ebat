import {
	PostType,
	Difficulty,
	PostCategory,
	SubCategory,
	TemplateFramework,
} from "@/db/schema/enums";

export interface TestPost {
	title: string;
	content: string;
	type: PostType;
	difficulty: Difficulty;
	category: PostCategory;
	subCategory: SubCategory;
	topics: string[];
	companies: string[];
	completionDuration: number;
}

export interface TestChallenge {
	title: string;
	description: string;
	frameworks: TemplateFramework[];
	difficulty: Difficulty;
	category: PostCategory;
	subCategory: SubCategory;
	questionTemplate: Record<string, unknown>;
	answerTemplate: Record<string, unknown>;
}

export interface TestComment {
	content: string;
	isReply?: boolean;
	parentId?: string;
}

export const testPosts: Record<string, TestPost> = {
	// Questions
	javascriptQuestion: {
		title: "How to implement debounce in JavaScript?",
		content:
			"Explain the concept of debouncing and provide a practical implementation.",
		type: PostType.QUESTION,
		difficulty: Difficulty.MEDIUM,
		category: PostCategory.FRONTEND,
		subCategory: SubCategory.JAVASCRIPT,
		topics: ["javascript", "debounce", "performance"],
		companies: ["Google", "Facebook"],
		completionDuration: 15,
	},

	reactQuestion: {
		title: "React Hooks vs Class Components",
		content:
			"Compare and contrast React Hooks with Class Components. When should you use each?",
		type: PostType.QUESTION,
		difficulty: Difficulty.EASY,
		category: PostCategory.FRONTEND,
		subCategory: SubCategory.REACT,
		topics: ["react", "hooks", "class-components"],
		companies: ["Netflix", "Airbnb"],
		completionDuration: 10,
	},

	// Challenges
	javascriptChallenge: {
		title: "Build a Todo App with Vanilla JavaScript",
		content:
			"Create a fully functional todo application using only vanilla JavaScript.",
		type: PostType.CHALLENGE,
		difficulty: Difficulty.EASY,
		category: PostCategory.FRONTEND,
		subCategory: SubCategory.VANILLAJS,
		topics: ["javascript", "todo", "dom-manipulation"],
		companies: ["Spotify", "Discord"],
		completionDuration: 30,
	},

	reactChallenge: {
		title: "Create a Weather App with React",
		content:
			"Build a weather application that fetches data from a weather API and displays it.",
		type: PostType.CHALLENGE,
		difficulty: Difficulty.MEDIUM,
		category: PostCategory.FRONTEND,
		subCategory: SubCategory.REACT,
		topics: ["react", "api", "weather", "async"],
		companies: ["Uber", "Lyft"],
		completionDuration: 45,
	},

	// Blogs
	javascriptBlog: {
		title: "Modern JavaScript Features You Should Know",
		content:
			"A comprehensive guide to modern JavaScript features including ES6+ syntax.",
		type: PostType.BLOGS,
		difficulty: Difficulty.EASY,
		category: PostCategory.FRONTEND,
		subCategory: SubCategory.JAVASCRIPT,
		topics: ["javascript", "es6", "modern-features"],
		companies: ["Microsoft", "Apple"],
		completionDuration: 20,
	},

	// System Design
	systemDesignBlog: {
		title: "Designing a URL Shortener Service",
		content:
			"Learn how to design a scalable URL shortening service like bit.ly.",
		type: PostType.SYSTEMDESIGN,
		difficulty: Difficulty.HARD,
		category: PostCategory.BACKEND,
		subCategory: SubCategory.SYSTEMDESIGN,
		topics: ["system-design", "scalability", "url-shortener"],
		companies: ["Amazon", "Google"],
		completionDuration: 60,
	},
};

export const testChallenges: Record<string, TestChallenge> = {
	todoApp: {
		title: "Todo App Challenge",
		description:
			"Build a todo application with add, edit, delete, and mark as complete functionality.",
		frameworks: [TemplateFramework.VANILLAJS, TemplateFramework.REACT],
		difficulty: Difficulty.EASY,
		category: PostCategory.FRONTEND,
		subCategory: SubCategory.JAVASCRIPT,
		questionTemplate: {
			description: "Create a todo app with the following features:",
			requirements: [
				"Add new todos",
				"Edit existing todos",
				"Delete todos",
				"Mark todos as complete",
				"Filter todos (all, active, completed)",
			],
			constraints: [
				"Use only vanilla JavaScript (no frameworks)",
				"Implement local storage for persistence",
				"Make it responsive",
			],
		},
		answerTemplate: {
			html: '<div id="todo-app"></div>',
			css: "/* Add your styles here */",
			javascript: "// Add your JavaScript here",
		},
	},

	weatherApp: {
		title: "Weather App Challenge",
		description:
			"Build a weather application that displays current weather and forecast.",
		frameworks: [TemplateFramework.REACT, TemplateFramework.NEXTJS],
		difficulty: Difficulty.MEDIUM,
		category: PostCategory.FRONTEND,
		subCategory: SubCategory.REACT,
		questionTemplate: {
			description: "Create a weather app with the following features:",
			requirements: [
				"Display current weather",
				"Show 5-day forecast",
				"Search by city name",
				"Display temperature, humidity, wind speed",
				"Show weather icons",
			],
			constraints: [
				"Use React hooks",
				"Implement error handling",
				"Make it responsive",
				"Use a weather API (OpenWeatherMap recommended)",
			],
		},
		answerTemplate: {
			components: {
				WeatherApp: "// Main weather app component",
				WeatherCard: "// Individual weather card component",
				SearchBar: "// City search component",
			},
			hooks: {
				useWeather: "// Custom hook for weather data",
			},
		},
	},
};

export const testComments: Record<string, TestComment> = {
	helpfulComment: {
		content: "Great question! Here's a solution using the debounce function...",
	},

	questionComment: {
		content: "Can you explain the time complexity of this approach?",
	},

	replyComment: {
		content:
			"The time complexity is O(1) for each call, but the function execution is delayed.",
		isReply: true,
	},

	spamComment: {
		content: "Check out my website for the best deals! Click here now!",
	},

	longComment: {
		content:
			"This is a very detailed comment that explains the concept in depth. It covers multiple aspects of the topic and provides comprehensive information that would be helpful for anyone trying to understand the subject matter. The comment includes examples, explanations, and references to additional resources.",
	},
};

export const testUserProfiles = {
	developer: {
		displayName: "John Developer",
		username: "johndev",
		bio: "Full-stack developer with 5+ years of experience in React, Node.js, and Python.",
		jobTitle: "Senior Software Engineer",
		companyName: "Tech Corp",
		location: "San Francisco, CA",
		experience: 5,
		externalLinks: {
			github: "https://github.com/johndev",
			linkedin: "https://linkedin.com/in/johndev",
			portfolio: "https://johndev.dev",
		},
	},

	beginner: {
		displayName: "Sarah Beginner",
		username: "sarahbeginner",
		bio: "Learning to code and excited to join the developer community!",
		jobTitle: "Student",
		companyName: "University",
		location: "New York, NY",
		experience: 1,
		externalLinks: {
			github: "https://github.com/sarahbeginner",
		},
	},

	expert: {
		displayName: "Mike Expert",
		username: "mikeexpert",
		bio: "Software architect with 15+ years of experience. Specialized in system design and scalability.",
		jobTitle: "Principal Software Architect",
		companyName: "Big Tech Inc",
		location: "Seattle, WA",
		experience: 15,
		externalLinks: {
			github: "https://github.com/mikeexpert",
			linkedin: "https://linkedin.com/in/mikeexpert",
			blog: "https://mikeexpert.blog",
			twitter: "https://twitter.com/mikeexpert",
		},
	},
};

export const testNotifications = {
	newFollower: {
		type: "follow",
		message: "John Developer started following you",
		isRead: false,
	},

	commentReply: {
		type: "comment_reply",
		message: "Sarah Beginner replied to your comment",
		isRead: false,
	},

	postApproved: {
		type: "post_approved",
		message: 'Your post "React Hooks Guide" has been approved',
		isRead: true,
	},

	challengeCompleted: {
		type: "challenge_completed",
		message: "Congratulations! You completed the Todo App challenge",
		isRead: false,
	},
};

export const testSearchQueries = {
	javascript: "javascript",
	react: "react hooks",
	systemDesign: "system design",
	interview: "interview questions",
	challenge: "coding challenge",
	invalid: "xyz123!@#",
	empty: "",
	long: "a".repeat(1000),
};

export const testCategories = {
	frontend: {
		name: "Frontend",
		slug: "frontend",
		subcategories: [
			"javascript",
			"react",
			"vue",
			"angular",
			"sveltekit",
			"vanillajs",
			"nextjs",
		],
	},

	backend: {
		name: "Backend",
		slug: "backend",
		subcategories: ["systemdesign"],
	},

	android: {
		name: "Android",
		slug: "android",
		subcategories: ["blogs"],
	},
};

// Helper functions
export const getRandomPost = (): TestPost => {
	const posts = Object.values(testPosts);
	return posts[Math.floor(Math.random() * posts.length)];
};

export const getPostsByType = (type: PostType): TestPost[] => {
	return Object.values(testPosts).filter((post) => post.type === type);
};

export const getPostsByDifficulty = (difficulty: Difficulty): TestPost[] => {
	return Object.values(testPosts).filter(
		(post) => post.difficulty === difficulty,
	);
};

export const getPostsByCategory = (category: PostCategory): TestPost[] => {
	return Object.values(testPosts).filter((post) => post.category === category);
};
