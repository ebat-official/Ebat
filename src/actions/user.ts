"use server";
import bcrypt from "bcryptjs";

import prisma from "@/lib/prisma";
import { User, UserProfile } from "@prisma/client";
import { validateVerificationToken } from "./auth";

type UserWithProfile = User & { userProfile: UserProfile | null };

export async function findUserByEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        name: true,
        userName:true,
        emailVerified:true,
        userProfile: {
          select: {
            id: true,
            image: true,
          },
        },
        role: true,
        karmaPoints: true,
        accountStatus: true,
      },
    });
    return user;
  } catch (error) {
    return null;
  }
}
export async function findUserById(id: string, includeProfile = false): Promise<User | UserWithProfile | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        userName: true,
        emailVerified: true,
        role: true,
        karmaPoints: true,
        accountStatus: true,
        userProfile: !!includeProfile,
      },
    });

    return user as UserWithProfile | User | null; 
  } catch (error) {
    console.error("Error finding user by ID:", error);
    return null;
  }
}

export async function setEmailVerified(email: string) {
  try {
    await prisma.user.update({
      where: {
        email,
      },
      data: { emailVerified: new Date() },
    });
    return true;
  } catch (error) {
    return null;
  }
}
export async function setEmailVerifiedUsingToken(token: string) {
  const user=await validateVerificationToken(token)

  if (typeof user.data !== "object" || !user.data?.email) {
    return null
  }

  try {
    await prisma.user.update({
      where: {
        email:user.data.email,
      },
      data: { emailVerified: new Date() },
    });
    return true;
  } catch (error) {
    return null;
  }
}
export async function updateUserPassword(email: string, password: string) {
  //get email from session
  try {
    await prisma.user.update({
      where: {
        email,
      },
      data: { password: bcrypt.hashSync(password, 12) },
    });
    return true;
  } catch (error) {
    return null;
  }
}
export async function updateUserName(id: string, userName: string) {
  try {
    await prisma.user.update({
      where: {
        id,
      },
      data: { userName},
    });
    return true;
  } catch (error) {
    return null;
  }
}


