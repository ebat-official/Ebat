"use server";

import { signIn } from "@/auth";
import prisma from "@/lib/prisma";
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
import { prismaCustomAdapter } from "@/prismaAdapter";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { User } from "@prisma/client";

type dataType = {
	token?: string;
	message?: string;
};
type AuthReturnType = {
	data: dataType | User;
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
	const userExist = await prisma.user.findUnique({
		where: {
			email: data.email,
		},
	});

	if (userExist) {
		return EMAIL_ALREADY_EXISTS_ERROR;
	}
	const customAdapter = prismaCustomAdapter();

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

		return { status: SUCCESS, data: {} };
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
		const record = await prisma.verificationToken.upsert({
			where: { email: email },
			update: { token: uuidToken, expires: tokenExpires },
			create: { email: email, token: uuidToken, expires: tokenExpires },
		});
		return { status: SUCCESS, data: record };
	} catch (error) {
		return SOMETHING_WENT_WRONG_ERROR;
	}
}
export async function validateVerificationToken(token: string) {
	try {
		const record = await prisma.verificationToken.findFirst({
			where: {
				token: token,
			},
		});

		if (record?.token === token) {
			if (record.expires.getTime() > new Date().getTime()) {
				return { status: SUCCESS, data: record };
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
		const record = await prisma.verificationToken.delete({
			where: {
				email: email,
			},
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
		const record = await prisma.resetToken.upsert({
			where: { email: email },
			update: { token: uuidToken, expires: tokenExpires },
			create: { email: email, token: uuidToken, expires: tokenExpires },
		});
		return { status: SUCCESS, data: record };
	} catch (error) {
		return SOMETHING_WENT_WRONG_ERROR;
	}
}
export async function validateResetToken(token: string) {
	try {
		const record = await prisma.resetToken.findFirst({
			where: {
				token: token,
			},
		});

		if (record?.token === token) {
			if (record.expires.getTime() > new Date().getTime()) {
				return { status: SUCCESS, data: record };
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
		const record = await prisma.resetToken.delete({
			where: {
				email: email,
			},
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
		const tokenData = await prisma.resetToken.findFirst({
			where: {
				token: token,
			},
		});
		if (!tokenData) {
			return { status: ERROR, data: INVALID_TOKEN_ERROR };
		}

		await prisma.user.update({
			where: {
				email: tokenData.email,
			},
			data: { password: bcrypt.hashSync(password, 12) },
		});
		deleteResetToken(tokenData.email);
		return true;
	} catch (error) {
		return null;
	}
}
