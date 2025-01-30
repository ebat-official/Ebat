import React from "react";
import Head from "next/head";

interface SEOData {
	title: string;
	metaDescription: string;
	slug: string;
	postId: string;
	image: string;
	author: string;
}

interface WithSEOProps {
	seoData: SEOData;
	[key: string]: unknown; // Allow other props to be passed down to the WrappedComponent
}

const withSEO = (WrappedComponent: React.ComponentType<any>) => {
	return ({ seoData, ...props }: WithSEOProps) => {
		const { title, metaDescription, slug, postId, image, author } = seoData;

		const metaTitle = title || "Default Title - Example Blog";
		const metaDescriptionContent = metaDescription || "Default description";
		const metaImage = image || "/default-image.jpg";
		const postUrl = `https://www.example.com/posts/${slug}-${postId}`;

		// Structured Data (JSON-LD) for rich snippets
		const structuredData = {
			"@context": "https://schema.org",
			"@type": "Article",
			headline: metaTitle,
			description: metaDescriptionContent,
			author: {
				"@type": "Person",
				name: author || "Unknown Author",
			},
			datePublished: new Date().toISOString(),
			image: metaImage,
			url: postUrl,
		};

		return (
			<>
				<Head>
					{/* Primary Meta Tags */}
					<title>{metaTitle}</title>
					<meta name="description" content={metaDescriptionContent} />

					{/* Open Graph Tags */}
					<meta property="og:type" content="article" />
					<meta property="og:title" content={metaTitle} />
					<meta property="og:description" content={metaDescriptionContent} />
					<meta property="og:image" content={metaImage} />
					<meta property="og:url" content={postUrl} />

					{/* Twitter Card Tags */}
					<meta name="twitter:card" content="summary_large_image" />
					<meta name="twitter:title" content={metaTitle} />
					<meta name="twitter:description" content={metaDescriptionContent} />
					<meta name="twitter:image" content={metaImage} />
					<meta name="twitter:url" content={postUrl} />

					{/* Structured Data for Rich Snippets */}
					<script
						type="application/ld+json"
						dangerouslySetInnerHTML={{
							__html: JSON.stringify(structuredData),
						}}
					/>

					{/* Canonical URL */}
					<link rel="canonical" href={postUrl} />

					{/* Robots Meta Tag */}
					<meta name="robots" content="index, follow" />
				</Head>
				<WrappedComponent {...props} />
			</>
		);
	};
};

export default withSEO;
