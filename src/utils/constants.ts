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
export const QUESTION_TYPE = "question";
export const INVALID_POST_ID = "Invalid post ID format";
export const POST_ID_REQUIRED = "Post ID is required";
export const TITLE_MIN_LENGTH = "Title must be at least 3 characters";
export const ANSWER_REQUIRED = "Answer content is required for questions";
export const POST_REQUIRED = "Post content is required";
export const TOPICS_REQUIRED = "Please select at least one topic";
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
export const FAILED_TO_SUBMIT_CHALLENGE = "Failed To Submit Challenge";
export const FAILED_TO_DELETE_SUBMISSION = "Failed To Delete Submission";
export const FAILED_TO_FETCH_SUBMISSIONS = "Failed To Fetch Submissions";
export const CHALLENGE_NOT_FOUND = "Challenge Not Found";
export const SUBMISSION_NOT_FOUND = "Submission Not Found";
export const AUTH_ERROR = "Auth Error";
export const INVALID_PAGE = "Invalid Page";
export const INVALID_PAGE_SIZE = "Invalid Page Size";
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
	TOP: "top",
	NEWEST: "newest",
	OLDEST: "oldest",
} as const;

export enum EndpointMap {
	PostSearch = "/api/post/search",
	// Add more endpoints as needed
}
export const CREDENTIAL_ACCOUNT_NOT_FOUND = "Credential account not found";

// Bookmark action types
export const BOOKMARK_ACTIONS = {
	ADD: "add",
	REMOVE: "remove",
} as const;

// Username availability status constants
export const USERNAME_STATUS = {
	IDLE: "idle",
	CHECKING: "checking",
	AVAILABLE: "available",
	UNAVAILABLE: "unavailable",
	ERROR: "error",
} as const;
