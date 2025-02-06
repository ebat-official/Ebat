
import {
    INVALID_CREDENTIALS,
    EMAIL_ALREADY_EXISTS,
    USER_NOT_FOUND,
    EMAIL_NOT_VERIFIED,
   UNKNOWN_ERROR as UNKNOWN_ERROR_MESSAGE ,
    UNAUTHORIZED,
    UNAUTHENTICATED,
    POST_VALIDATION,
    DATABASE_ERROR as DATABASE_ERROR_MESSAGE,
    FAILED_TO_SAVE_DRAFT,
    FAILED_TO_PUBLISH_POST,
    SOMETHING_WENT_WRONG,
    ERROR
  } from "@/utils/contants";
  
  // Define errors with more user-friendly cause names
  export const INVALID_USERNAME_PASSWORD_ERROR = {
    status: ERROR,
    cause: INVALID_CREDENTIALS,
    data: { message: "User email or password is incorrect" },
  };
  
  export const EMAIL_ALREADY_EXISTS_ERROR = {
    status: ERROR,
    cause: EMAIL_ALREADY_EXISTS,
    data: { message: "Email already exists" },
  };
  
  export const NO_USER_FOUND_ERROR = {
    status: ERROR,
    cause: USER_NOT_FOUND,
    data: { message: "User doesn't exist" },
  };
  
  export const EMAIL_NOT_VERIFIED_ERROR = {
    status: ERROR,
    cause: EMAIL_NOT_VERIFIED,
    data: { message: "User Email Not Verified" },
  };
  
  export const SOMETHING_WENT_WRONG_ERROR = {
    status: ERROR,
    cause: UNKNOWN_ERROR_MESSAGE,
    data: { message: SOMETHING_WENT_WRONG },
  };
  
  export const UNAUTHORIZED_ERROR = {
    status: ERROR,
    cause: UNAUTHORIZED,
    data: { message: "User is not authorized to perform this action" },
  };
  
  export const UNAUTHENTICATED_ERROR = {
    status: ERROR,
    cause: UNAUTHENTICATED,
    data: { message: "User needs to be signed in to perform this action" },
  };
  
  export const VALIDATION_ERROR = {
    status: ERROR,
    cause: POST_VALIDATION,
    data: { message: "Validation failed" },
  };
  
  export const DATABASE_ERROR = {
    status: ERROR,
    cause: DATABASE_ERROR_MESSAGE,
    data: { message: "Could not complete the operation. Please try again" },
  };
  
  export const UNKNOWN_ERROR = {
    status: ERROR,
    cause: UNKNOWN_ERROR_MESSAGE,
    data: { message: "An unexpected error occurred" },
  };
  
  export const FAILED_TO_SAVE_DRAFT_ERROR = {
    status: ERROR,
    cause: FAILED_TO_SAVE_DRAFT,
    data: { message: "Failed to save draft" },
  };
  
  export const FAILED_TO_PUBLISH_POST_ERROR = {
    status: ERROR,
    cause: FAILED_TO_PUBLISH_POST,
    data: { message: "Failed to publish post" },
  };

  export const FAILED_TO_EDIT_POST_ERROR = {
    status: ERROR,
    cause: "FAILED_TO_EDIT_POST",
    data: { message: "Failed to edit the post" },
  }
  
  
  // ✅ Functions to throw structured errors
  export function UserNotAuthenticatedErr() {
    return Object.assign(new Error(UNAUTHENTICATED_ERROR.data.message), UNAUTHENTICATED_ERROR);
  }
  
  export function UserNotAuthorizedErr() {
    return Object.assign(new Error(UNAUTHORIZED_ERROR.data.message), UNAUTHORIZED_ERROR);
  }
  
  export function ValidationErr(message: string) {
    return Object.assign(new Error(message), { ...VALIDATION_ERROR, data: { message } });
  }
  
  export function DatabaseErr(message: string) {
    return Object.assign(new Error(message), { ...DATABASE_ERROR, data: { message } });
  }
  
  export function UnknownErr(message: string = UNKNOWN_ERROR.data.message) {
    return Object.assign(new Error(message), { ...UNKNOWN_ERROR, data: { message } });
  }
  
  export function FailedToSaveDraftErr() {
    return Object.assign(new Error(FAILED_TO_SAVE_DRAFT_ERROR.data.message), FAILED_TO_SAVE_DRAFT_ERROR);
  }
  
  export function FailedToPublishPostErr() {
    return Object.assign(new Error(FAILED_TO_PUBLISH_POST_ERROR.data.message), FAILED_TO_PUBLISH_POST_ERROR);
  }
  export function FailedToEditPostErr(message:string=FAILED_TO_EDIT_POST_ERROR.data.message) {
    return Object.assign(new Error(message), { ...FAILED_TO_EDIT_POST_ERROR, data: { message } });
  }
  
  export function InvalidUsernamePasswordErr() {
    return Object.assign(new Error(INVALID_USERNAME_PASSWORD_ERROR.data.message), INVALID_USERNAME_PASSWORD_ERROR);
  }
  
  export function EmailAlreadyExistsErr() {
    return Object.assign(new Error(EMAIL_ALREADY_EXISTS_ERROR.data.message), EMAIL_ALREADY_EXISTS_ERROR);
  }
  
  export function NoUserFoundErr() {
    return Object.assign(new Error(NO_USER_FOUND_ERROR.data.message), NO_USER_FOUND_ERROR);
  }
  
  export function EmailNotVerifiedErr() {
    return Object.assign(new Error(EMAIL_NOT_VERIFIED_ERROR.data.message), EMAIL_NOT_VERIFIED_ERROR);
  }
  