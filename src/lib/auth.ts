import { account, ID } from "./appwrite";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export async function registerUser({ name, email, password }: RegisterInput) {
  const user = await account.create({
    userId: ID.unique(),
    email,
    password,
    name,
  });

  return user;
}

export async function loginUser({ email, password }: LoginInput) {
  // Check whether a session already exists
  try {
    await account.get();

    // If a session exists, remove it before logging in
    // with the requested account.
    await account.deleteSession({
      sessionId: "current",
    });
  } catch {
    // No active session, so continue with login.
  }

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
