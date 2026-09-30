import { Query, tablesDB } from "./appwrite";

import type { AppUser } from "../types/user";

const DATABASE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

const USERS_TABLE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!;

export async function createUserProfile(
  userId: string,
  name: string,
  email: string
) {
  return await tablesDB.createRow({
    databaseId: DATABASE_ID,
    tableId: USERS_TABLE_ID,
    rowId: userId,
    data: {
      userId,
      name,
      email,
      createdAt: new Date().toISOString(),
    },
  });
}

export async function getAllUsers() {
  const response = await tablesDB.listRows<AppUser>({
    databaseId: DATABASE_ID,
    tableId: USERS_TABLE_ID,
    queries: [
      Query.orderAsc("name"),
      Query.limit(100),
    ],
  });

  return response.rows;
}