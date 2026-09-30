import { NextRequest, NextResponse } from "next/server";
import {
  ID,
  Permission,
  Role,
} from "node-appwrite";

import {
  createJWTAccount,
  createServerTablesDB,
} from "@/src/lib/server/appwrite";

const DATABASE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

const MESSAGES_TABLE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID!;

interface SendMessageRequest {
  senderId: string;
  recipientId: string;
  senderName: string;
  content: string;
}

export async function POST(
  request: NextRequest
) {
  try {
    // 1. Get JWT from Authorization header
    const authorization =
      request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Authentication required." },
        { status: 401 }
      );
    }

    const jwt = authorization.substring(7);

    // 2. Verify JWT with Appwrite
    const account = createJWTAccount(jwt);
    const authenticatedUser = await account.get();

    // 3. Read request body
    const body =
      (await request.json()) as SendMessageRequest;

    const {
      senderId,
      recipientId,
      senderName,
      content,
    } = body;

    // 4. Validate message data
    if (
      !senderId ||
      !recipientId ||
      !senderName ||
      !content?.trim()
    ) {
      return NextResponse.json(
        { message: "Invalid message data." },
        { status: 400 }
      );
    }

    if (senderId === recipientId) {
      return NextResponse.json(
        {
          message:
            "You cannot send a message to yourself.",
        },
        { status: 400 }
      );
    }

    // 5. Verify senderId belongs to logged-in user
    if (authenticatedUser.$id !== senderId) {
      return NextResponse.json(
        { message: "Invalid sender." },
        { status: 403 }
      );
    }

    // 6. Create message using server API key
    const tablesDB = createServerTablesDB();

    const message = await tablesDB.createRow({
      databaseId: DATABASE_ID,
      tableId: MESSAGES_TABLE_ID,
      rowId: ID.unique(),

      data: {
        senderId: authenticatedUser.$id,
        recipientId,
        senderName: authenticatedUser.name,
        content: content.trim(),
        createdAt: new Date().toISOString(),
      },

      permissions: [
        Permission.read(
          Role.user(authenticatedUser.$id)
        ),
        Permission.read(
          Role.user(recipientId)
        ),
      ],
    });

    return NextResponse.json(message, {
      status: 201,
    });
  } catch (error) {
    console.error(
      "Failed to create message:",
      error
    );

    return NextResponse.json(
      { message: "Failed to send message." },
      { status: 500 }
    );
  }
}