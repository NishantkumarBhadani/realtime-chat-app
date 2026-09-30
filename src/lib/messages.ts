import {
  Query,
  tablesDB,
} from "@/src//lib/appwrite";

import { createUserJWT } from "./auth";
import type { Message } from "@/src/types/message";

const DATABASE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

const MESSAGES_TABLE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID!;

export async function sendMessage({
  senderId,
  recipientId,
  senderName,
  content,
}: {
  senderId: string;
  recipientId: string;
  senderName: string;
  content: string;
}) {
  const jwt = await createUserJWT();

  const response = await fetch("/api/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({
      senderId,
      recipientId,
      senderName,
      content,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || "Failed to send message."
    );
  }

  return data as Message;
}
export async function getConversationMessages(
  currentUserId: string,
  selectedUserId: string
) {
  const response = await tablesDB.listRows<Message>({
    databaseId: DATABASE_ID,
    tableId: MESSAGES_TABLE_ID,

    queries: [
      Query.or([
        Query.and([
          Query.equal("senderId", [currentUserId]),
          Query.equal("recipientId", [selectedUserId]),
        ]),

        Query.and([
          Query.equal("senderId", [selectedUserId]),
          Query.equal("recipientId", [currentUserId]),
        ]),
      ]),

      Query.orderAsc("createdAt"),
      Query.limit(100),
    ],
  });

  return response.rows;
}