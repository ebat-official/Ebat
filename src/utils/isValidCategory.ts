import { PostCategory } from "@prisma/client";


const categorySupportedTypes = new Set(Object.values(PostCategory));

export default  function isValidCategory(category: string): category is PostCategory {
    return categorySupportedTypes.has(category as PostCategory);
  }