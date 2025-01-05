"use server";

import { signIn } from "@/auth";
import prisma from "@/lib/prisma";
import { defaultLoginRedirect } from "@/utils/routes";
import { authFormSchema, authFormSchemaType } from "@/schemas/authForm";
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

type AuthReturnType = {
  type: string;
  data: any;
  cause?: string;
};

export async function signUp(data: authFormSchemaType): Promise<AuthReturnType> {
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
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: bcrypt.hashSync(data.password, 12),
    },
  });

  if (!user) {
    return SOMETHING_WENT_WRONG_ERROR;
  }
  //send verification mail
  const verification = await upsertVerificationToken(user.email);
  mailer(user.email, EMAIL_VALIDATION, verification.data?.token);
  return { type: SUCCESS, data: user };
}

export async function logIn(data: authFormSchemaType): Promise<AuthReturnType> {
  const validateFields = authFormSchema.safeParse(data);
  if (!validateFields.success) {
    return INVALID_USERNAME_PASSWORD_ERROR;
  }
  const { email, password } = validateFields.data;
  try {
    await signIn("credentials", { email, password, redirectTo: defaultLoginRedirect });
    return { type: SUCCESS, data: "" };
  } catch (error) {
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
        default:
          return SOMETHING_WENT_WRONG_ERROR;
      }
    }
    throw error;
  }
}
// Verification Tokens
export async function upsertVerificationToken(email: string): Promise<AuthReturnType> {
  const user = await findUserByEmail(email);
  if (!user) return NO_USER_FOUND_ERROR;
  const uuidToken = uuidv4();
  const tokenExpires = new Date(new Date().getTime() + Number(process.env.VERIFICATION_TOKEN_EXPIRES));
  try {
    const record = await prisma.verificationToken.upsert({
      where: { email: email },
      update: { token: uuidToken, expires: tokenExpires },
      create: { email: email, token: uuidToken, expires: tokenExpires },
    });
    return { type: SUCCESS, data: record };
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
        return { type: SUCCESS, data: record };
      } else {
        return { type: ERROR, data: TOKEN_EXPIRED };
      }
    }
    return { type: ERROR, data: INVALID_TOKEN_ERROR };
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

    return { type: SUCCESS, data: record };
  } catch (error) {
    return SOMETHING_WENT_WRONG_ERROR;
  }
}

// Rest Tokens
export async function upsertResetToken(email: string): Promise<AuthReturnType> {
  const user = await findUserByEmail(email);
  if (!user) return NO_USER_FOUND_ERROR;
  const uuidToken = uuidv4();
  const tokenExpires = new Date(new Date().getTime() + Number(process.env.VERIFICATION_TOKEN_EXPIRES));
  try {
    const record = await prisma.resetToken.upsert({
      where: { email: email },
      update: { token: uuidToken, expires: tokenExpires },
      create: { email: email, token: uuidToken, expires: tokenExpires },
    });
    return { type: SUCCESS, data: record };
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
        return { type: SUCCESS, data: record };
      } else {
        return { type: ERROR, data: TOKEN_EXPIRED };
      }
    }
    return { type: ERROR, data: INVALID_TOKEN_ERROR };
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

    return { type: SUCCESS, data: record };
  } catch (error) {
    return SOMETHING_WENT_WRONG_ERROR;
  }
}
