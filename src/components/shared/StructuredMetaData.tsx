import { generatePostPathFromPostId } from "@/utils/generatePostPath";
import { generateStructuredData, PostWithAuthor } from "@/utils/metadata";

function StructuredMetaData({ post }: { post: PostWithAuthor }) {
	const structuredData = generateStructuredData(post, {
		url: generatePostPathFromPostId(post),
	});

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{
				__html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
			}}
		/>
	);
}
export default StructuredMetaData;
