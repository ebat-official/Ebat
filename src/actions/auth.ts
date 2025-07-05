"use server";

import { signIn } from "@/auth";
import { db } from "@/db";
import { users, verificationTokens, resetTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { selectUserSchema } from "@/db/schema/zod-schemas";
import type { User } from "@/db/schema/zod-schemas";
import { defaultLoginRedirect } from "@/utils/routes";
import { authFormSchema, authFormSchemaType } from "@/lib/validators/authForm";
import {
	EMAIL_ALREADY_EXISTS_ERROR,
	EMAIL_NOT_VERIFIED_ERROR,
	INVALID_USERNAME_PASSWORD_ERROR,
	SOMETHING_WENT_WRONG_ERROR,
	NO_USER_FOUND_ERROR,
} from "@/utils/errors";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import {
	EMAIL_NOT_VERIFIED,
	EMAIL_VALIDATION,
	ERROR,
	INVALID_TOKEN_ERROR,
	SUCCESS,
	TOKEN_EXPIRED,
} from "@/utils/contants";
import { v4 as uuidv4 } from "uuid";
import { findUserByEmail } from "@/actions/user";
import mailer from "@/lib/mailer";
import { drizzleCustomAdapter } from "@/drizzleAdapter";
import { isRedirectError } from "next/dist/client/components/redirect-error";

type dataType = {
	token?: string;
	message?: string;
};

type ErrorDataType = {
	message: string;
};

type AuthReturnType = {
	data: User | ErrorDataType;
	cause?: string;
	status: string;
};

type TokenType = {
	id: string;
	email: string;
	token: string;
	expires: Date;
};
type TokenReturnType = {
	data: TokenType | dataType;
	cause?: string;
	status: string;
};

export async function signUp(
	data: authFormSchemaType,
): Promise<AuthReturnType> {
	const validateFields = authFormSchema.safeParse(data);
	if (!validateFields.success) {
		return INVALID_USERNAME_PASSWORD_ERROR;
	}
	const userExist = await db
		.select()
		.from(users)
		.where(eq(users.email, data.email))
		.limit(1);

	if (userExist.length > 0) {
		return EMAIL_ALREADY_EXISTS_ERROR;
	}
	const customAdapter = drizzleCustomAdapter();

	const user = await customAdapter.createUser({
		name: data.name,
		email: data.email,
		// @ts-ignore
		password: bcrypt.hashSync(data.password, 12),
	});
	if (!user) {
		return SOMETHING_WENT_WRONG_ERROR;
	}
	//send verification mail
	const verification = await upsertVerificationToken(user.email);
	if (verification.status !== SUCCESS) {
		return SOMETHING_WENT_WRONG_ERROR;
	}
	mailer(user.email, EMAIL_VALIDATION, verification.data?.token);
	return { status: SUCCESS, data: user };
}

export async function logIn(data: authFormSchemaType): Promise<AuthReturnType> {
	const validateFields = authFormSchema.safeParse(data);

	if (!validateFields.success) {
		return INVALID_USERNAME_PASSWORD_ERROR;
	}
	const { email, password } = validateFields.data;
	try {
		await signIn("credentials", { email, password });

		return { status: SUCCESS, data: { message: "Login successful" } };
	} catch (error) {
		if (isRedirectError(error)) {
			throw error;
		}
		if (error instanceof AuthError) {
			switch (error.type) {
				case "CredentialsSignin":
					return INVALID_USERNAME_PASSWORD_ERROR;
				case "CallbackRouteError":
					return INVALID_USERNAME_PASSWORD_ERROR;
				case "AccessDenied":
					if (error.cause?.err?.message === EMAIL_NOT_VERIFIED) {
						return EMAIL_NOT_VERIFIED_ERROR;
					}
					return SOMETHING_WENT_WRONG_ERROR;

				default:
					return SOMETHING_WENT_WRONG_ERROR;
			}
		}
		throw SOMETHING_WENT_WRONG_ERROR;
	}
}
// Verification Tokens
export async function upsertVerificationToken(
	email: string,
): Promise<TokenReturnType> {
	const user = await findUserByEmail(email);
	if (!user) return NO_USER_FOUND_ERROR;
	const uuidToken = uuidv4();
	const tokenExpires = new Date(
		new Date().getTime() + Number(process.env.VERIFICATION_TOKEN_EXPIRES),
	);
	try {
		const record = await db
			.insert(verificationTokens)
			.values({
				email: email,
				token: uuidToken,
				expires: tokenExpires,
			})
			.onConflictDoUpdate({
				target: verificationTokens.email,
				set: {
					token: uuidToken,
					expires: tokenExpires,
				},
			})
			.returning({
				token: verificationTokens.token,
				expires: verificationTokens.expires,
			});
		return { status: SUCCESS, data: record };
	} catch (error) {
		return SOMETHING_WENT_WRONG_ERROR;
	}
}
export async function validateVerificationToken(token: string) {
	try {
		const record = await db
			.select()
			.from(verificationTokens)
			.where(eq(verificationTokens.token, token))
			.limit(1);

		if (record.length > 0) {
			if (record[0].expires.getTime() > new Date().getTime()) {
				return { status: SUCCESS, data: record[0] };
			}
			return { status: ERROR, data: TOKEN_EXPIRED };
		}
		return { status: ERROR, data: INVALID_TOKEN_ERROR };
	} catch (error) {
		return SOMETHING_WENT_WRONG_ERROR;
	}
}
export async function deleteVerificationToken(email: string) {
	try {
		const record = await db
			.delete(verificationTokens)
			.where(eq(verificationTokens.email, email))
			.returning({
				token: verificationTokens.token,
			});

		return { status: SUCCESS, data: record };
	} catch (error) {
		return SOMETHING_WENT_WRONG_ERROR;
	}
}

// Rest Tokens
export async function upsertResetToken(
	email: string,
): Promise<TokenReturnType> {
	const user = await findUserByEmail(email);
	if (!user) return NO_USER_FOUND_ERROR;
	const uuidToken = uuidv4();
	const tokenExpires = new Date(
		new Date().getTime() + Number(process.env.VERIFICATION_TOKEN_EXPIRES),
	);
	try {
		const record = await db
			.insert(resetTokens)
			.values({
				email: email,
				token: uuidToken,
				expires: tokenExpires,
			})
			.onConflictDoUpdate({
				target: resetTokens.email,
				set: {
					token: uuidToken,
					expires: tokenExpires,
				},
			})
			.returning({
				token: resetTokens.token,
				expires: resetTokens.expires,
			});
		return { status: SUCCESS, data: record };
	} catch (error) {
		return SOMETHING_WENT_WRONG_ERROR;
	}
}
export async function validateResetToken(token: string) {
	try {
		const record = await db
			.select()
			.from(resetTokens)
			.where(eq(resetTokens.token, token))
			.limit(1);

		if (record.length > 0) {
			if (record[0].expires.getTime() > new Date().getTime()) {
				return { status: SUCCESS, data: record[0] };
			}
			return { status: ERROR, data: TOKEN_EXPIRED };
		}

		return { status: ERROR, data: INVALID_TOKEN_ERROR };
	} catch (error) {
		return SOMETHING_WENT_WRONG_ERROR;
	}
}

export async function deleteResetToken(email: string) {
	try {
		const record = await db
			.delete(resetTokens)
			.where(eq(resetTokens.email, email))
			.returning({
				token: resetTokens.token,
			});

		return { status: SUCCESS, data: record };
	} catch (error) {
		return SOMETHING_WENT_WRONG_ERROR;
	}
}

export async function updateUserPasswordWithToken(
	token: string,
	password: string,
) {
	try {
		const tokenData = await db
			.select()
			.from(resetTokens)
			.where(eq(resetTokens.token, token))
			.limit(1);
		if (tokenData.length === 0) {
			return { status: ERROR, data: INVALID_TOKEN_ERROR };
		}

		await db
			.update(users)
			.set({ password: bcrypt.hashSync(password, 12) })
			.where(eq(users.email, tokenData[0].email));
		deleteResetToken(tokenData[0].email);
		return true;
	} catch (error) {
		return null;
	}
}
