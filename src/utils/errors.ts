import { EMAIL_NOT_VERIFIED, SOMETHING_WENT_WRONG, UNAUTHORIZED, UNAUTHENTICATED } from "./contants";

export const INVALID_USERNAME_PASSWORD_ERROR = { type: "error", data: "User email or password is incorrect" };
export const SOMETHING_WENT_WRONG_ERROR = { type: "error", data: SOMETHING_WENT_WRONG };
export const EMAIL_ALREADY_EXISTS_ERROR = { type: "error", data: "Email already exists" };
export const EMAIL_NOT_VERIFIED_ERROR = { type: "error", cause: EMAIL_NOT_VERIFIED, data: "User Email Not verified" };
export const NO_USER_FOUND_ERROR = { type: "error", cause: "User doesn't exist", data: "User doesn't exist" };
export const UNAUTHORIZED_ERROR = { status: "error", cause: UNAUTHORIZED, data: { message: "User is not authorized to perform this action" } };
export const UNAUTHENTICATED_ERROR = { status: "error", cause: UNAUTHENTICATED, data: { message: "User needs to be signed in to perform this action" } };

export function UserNotAuthenticatedErr(){
    return Object.assign(new Error(UNAUTHENTICATED_ERROR.data.message), UNAUTHENTICATED_ERROR)
}
export function UserNotAuthorizedErr(){
    return Object.assign(new Error(UNAUTHORIZED_ERROR.data.message), UNAUTHORIZED_ERROR)
}