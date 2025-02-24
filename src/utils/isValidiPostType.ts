import { PostType } from "@prisma/client";


const supportedTypes = new Set(Object.values(PostType));

export default  function isValidPostType(type: string): type is PostType {
    console.log("postty",type,supportedTypes)
    return supportedTypes.has(type as PostType);
  }