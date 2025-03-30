import { ZodError } from "zod";
import { PostType } from "@prisma/client";
import { CustomErrorType } from "./types";
import { INVALID_DIFFICULTY } from "./contants";

export const sanitizeErrorMessage = (
	message: string,
	postType?: PostType,
): string => {
	if (postType === "QUESTION") {
		return message.replace(/\btitle\b/gi, "question");
	}
	return message;
};

export const handleError = (error: unknown, postType: PostType): string => {
	if (error instanceof ZodError) {
		const firstError = error.errors[0];

		let errorMessage = firstError.message;

		if (errorMessage === INVALID_DIFFICULTY) {
			errorMessage = "Please select a difficulty level";
		}
		// If the message is just "Required", replace it with "Invalid {fieldName}"
		if (errorMessage === "Required" && firstError.path.length > 0) {
			errorMessage = `Invalid ${firstError.path.join(".")}`;
		}

		return sanitizeErrorMessage(errorMessage, postType);
	}

	if (error instanceof Error) {
		console.log("pranu", error);
		if (error.message.includes("Something went wrong")) {
			return "Database error";
		}

		return error.message;
	}
	const customError = error as CustomErrorType;
	if (customError?.data?.message) {
		return customError.data.message;
	}

	return "Unknown error";
};
