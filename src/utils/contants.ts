export const SOMETHING_WENT_WRONG = "Something went Wrong !!!";
export const EMAIL_NOT_VERIFIED = "EmailNotVerified";
export const EMAIL_VERIFICATION = "EmailVerification";
export const SUCCESS = "success";
export const FAIL = "fail";
export const ERROR = "error";
export const INVALID_TOKEN_ERROR = "Invalid token";
export const TOKEN_EXPIRED = "Token expired";
export const RESET_PASSWORD = "reset password";
export const EMAIL_VALIDATION = "email validation";
export const LOADING = "loading";
export const TOKEN = "token";
export const VERIFICATION_SUCCESSFULL = "Verification successfull";
export const TOKEN_NOT_FOUND = "Token not found";
export const UNAUTHORIZED = "Unauthorized";
export const UNAUTHENTICATED = "Unauthenticated";
export const INVALID_POST_TYPE = "Invalid post type";
export const INVALID_DIFFICULTY = "Invalid difficulty";
export const INVALID_CATEGORY = "Invalid category";
export const INVALID_SUBCATEGORY = "Invalid subCategory";
export const QUESTION_TYPE = "QUESTION";
export const INVALID_POST_ID = "Invalid post ID format";
export const TITLE_MIN_LENGTH = "Title must be at least 3 characters";
export const ANSWER_REQUIRED = "Answer content is required for questions";
export const POST_REQUIRED = "Post content is required";
export const INVALID_CREDENTIALS = "Invalid Credential";
export const EMAIL_ALREADY_EXISTS = "Email Already Exists";
export const USER_NOT_FOUND = "User Not Found";
export const UNKNOWN_ERROR = "Unknown Error";
export const POST_VALIDATION = "Post Validation";
export const DATABASE_ERROR = "Database Error";
export const FAILED_TO_SAVE_DRAFT = "Failed To Save Draft";
export const FAILED_TO_PUBLISH_POST = "Failed To Publish Post";
export const FAILED_TO_EDIT_POST = "Failed To Edit Post";
export const FAILED_TO_ADD_COMMENT = "Failed To Add Comment";
export const FAILED_TO_EDIT_DRAFT = "Failed To Edit Post Draft";
export const CANNOT_EDIT_PUBLISHED_POST = "Cannot Edit a Published Post";
export const PASSWORD = "password";
export const TEXT = "text";
export const POST_ACTIONS = {
	EDIT: "edit",
	CREATE: "create",
} as const;
export const POST_ROUTE_TYPE = {
	DEFAULT: "",
	DRAFTS: "draft",
	EDIT: "edit",
} as const;

export const COMMENT_SORT_OPTIONS = {
	TOP: "TOP",
	NEWEST: "NEWEST",
	OLDEST: "OLDEST",
} as const;
