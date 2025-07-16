import { PostType } from "@/db/schema/enums";
import { ZodError } from "zod";
import { INVALID_DIFFICULTY } from "./constants";
import { CustomErrorType, GenerateActionReturnType } from "./types";

export const sanitizeErrorMessage = (
	message: string,
	postType?: PostType,
): string => {
	if (postType === PostType.QUESTION) {
		return message.replace(/\btitle\b/gi, "question");
	}
	return message;
};

export function isErrorAction<SuccessDataType>(
	action: GenerateActionReturnType<SuccessDataType>,
): action is { status: "error"; data: { message: string } } {
	return action.status === "error";
}

export const handleError = (error: unknown, postType?: PostType): string => {
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
	if (isErrorAction(error as GenerateActionReturnType<unknown>)) {
		// @ts-ignore
		return sanitizeErrorMessage(error?.data?.message);
	}

	if (error instanceof Error) {
		if (error.message.includes("Something went wrong")) {
			return "Something went wrong";
		}

		return error.message;
	}
	const customError = error as CustomErrorType;
	if (customError?.data?.message) {
		return customError.data.message;
	}

	return "Unknown error";
};
