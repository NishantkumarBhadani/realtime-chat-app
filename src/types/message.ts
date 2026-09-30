import type { Models } from "appwrite";

export interface Message extends Models.Row {
  senderId: string;
  recipientId: string;
  senderName: string;
  content: string;
  createdAt: string;
}