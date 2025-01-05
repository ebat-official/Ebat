"use server";
import bcrypt from "bcryptjs";

import prisma from "@/lib/prisma";

export async function findUserByEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    return user;
  } catch (error) {
    return null;
  }
}
export async function findUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    return user;
  } catch (error) {
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
export async function updateUserPassword(email: string, password: string) {
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
