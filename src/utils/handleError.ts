import { ZodError } from "zod";
import {
  UNAUTHENTICATED_ERROR,
  UNAUTHORIZED_ERROR,
  VALIDATION_ERROR,
  DATABASE_ERROR,
  UNKNOWN_ERROR,
  INVALID_USERNAME_PASSWORD_ERROR,
  EMAIL_ALREADY_EXISTS_ERROR,
  NO_USER_FOUND_ERROR,
  EMAIL_NOT_VERIFIED_ERROR,
  FAILED_TO_SAVE_DRAFT_ERROR,
  FAILED_TO_PUBLISH_POST_ERROR,
} from "@/utils/errors";

interface HandledError {
  status: string;
  cause?: string;
  data: { message: string };
}

export const handleError = (error: unknown): HandledError => {
  if (error instanceof ZodError) {
    // Handle Zod validation errors with cleaned messages
    const firstError = error.errors[0];
    const cleanMessage = firstError.message.replace(/^String/, "").trim();

    return {
      ...VALIDATION_ERROR,
      data: { message: cleanMessage },
    };
  }

  if (error instanceof Error) {
    switch (error.message) {
      case UNAUTHENTICATED_ERROR.data.message:
        return UNAUTHENTICATED_ERROR;

      case UNAUTHORIZED_ERROR.data.message:
        return UNAUTHORIZED_ERROR;

      case INVALID_USERNAME_PASSWORD_ERROR.data.message:
        return INVALID_USERNAME_PASSWORD_ERROR;

      case EMAIL_ALREADY_EXISTS_ERROR.data.message:
        return EMAIL_ALREADY_EXISTS_ERROR;

      case NO_USER_FOUND_ERROR.data.message:
        return NO_USER_FOUND_ERROR;

      case EMAIL_NOT_VERIFIED_ERROR.data.message:
        return EMAIL_NOT_VERIFIED_ERROR;

      case FAILED_TO_SAVE_DRAFT_ERROR.data.message:
        return FAILED_TO_SAVE_DRAFT_ERROR;

      case FAILED_TO_PUBLISH_POST_ERROR.data.message:
        return FAILED_TO_PUBLISH_POST_ERROR;
    }

    if (error.message.includes("Something went wrong")) {
      return DATABASE_ERROR;
    }

    // Fallback to the original error message
    return {
      ...UNKNOWN_ERROR,
      data: { message: error.message },
    };
  }

  return UNKNOWN_ERROR;
};
