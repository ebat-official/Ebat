import { PostType } from "@prisma/client";

const supportedTypes = new Set(Object.values(PostType));

export default function isValidPostType(
	type: string | undefined,
): type is PostType {
	return supportedTypes.has(type as PostType);
}
