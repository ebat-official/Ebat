import { generatePostPathFromPostId } from "@/utils/generatePostPath";
import { generateStructuredData } from "@/utils/metadata";
import { PostWithExtraDetails } from "@/utils/types";

function StructuredMetaData({ post }: { post: PostWithExtraDetails }) {
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
