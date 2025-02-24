// // pages/posts/[titleSlug]/page.tsx
// import { GetStaticProps, GetStaticPaths } from "next";
// import { useRouter } from "next/router";
// import withSEO from "@/components/withSEO"; // Assuming you have an HOC for SEO
// import prisma from "@/lib/prisma"; // Your database handler

// export const getStaticPaths: GetStaticPaths = async () => {
// 	// Fetch the slugs for all posts
// 	const posts = await prisma.post.findMany({
// 		select: { slug: true }, // Get only the slugs
// 	});

// 	const paths = posts.map((post) => ({
// 		params: { titleSlug: post.slug },
// 	}));

// 	return {
// 		paths,
// 		fallback: true, // Enable fallback to show loading for new pages
// 	};
// };

// export const getStaticProps: GetStaticProps = async ({ params }) => {
// 	const { titleSlug } = params;

// 	// Fetch the post data based on titleSlug
// 	const post = await prisma.post.findUnique({
// 		where: {
// 			slug: titleSlug, // Assuming titleSlug is stored as `slug` in the database
// 		},
// 	});

// 	// Prepare SEO data
// 	const seoData = {
// 		title: post.title,
// 		metaDescription: post.content.slice(0, 150),
// 		slug: post.slug,
// 		postId: post.id,
// 		image: post.image || "/default-image.jpg",
// 		author: post.author.name,
// 	};

// 	return {
// 		props: {
// 			post,
// 			seoData,
// 		},
// 		revalidate: 60, // Optional: Revalidate the page every 60 seconds
// 	};
// };

// const PostPage = ({ post }) => {
// 	const router = useRouter();

// 	// Check if the page is in fallback state
// 	if (router.isFallback) {
// 		return (
// 			<div className="loading-container">
// 				{/* Your custom loading spinner or skeleton */}
// 				<div className="spinner">Loading...</div>
// 			</div>
// 		);
// 	}

// 	// Render the post content once it's available
// 	return (
// 		<div>
// 			<h1>{post.title}</h1>
// 			<div>{post.content}</div>
// 		</div>
// 	);
// };

// // Wrap the PostPage component with withSEO (for SEO metadata)
// export default withSEO(PostPage);
