import { account,ID } from "./appwrite";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export async function registerUser({
  name,
  email,
  password,
}: RegisterInput) {
  const user = await account.create({
    userId: ID.unique(),
    email,
    password,
    name,
  });

  return user;
}

export async function loginUser({
  email,
  password,
}: LoginInput) {
  const session = await account.createEmailPasswordSession({
    email,
    password,
  });

  return session;
}

export async function getCurrentUser() {
  try {
    return await account.get();
  } catch {
    return null;
  }
}

export async function logoutUser() {
  await account.deleteSession({
    sessionId: "current",
  });
}

export async function createUserJWT() {
  const response = await account.createJWT();

  return response.jwt;
}