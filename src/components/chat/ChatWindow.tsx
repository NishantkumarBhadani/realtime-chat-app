"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

import type { AppUser } from "@/src/types/user";
import type { Message } from "@/src/types/message";

import { getConversationMessages, sendMessage } from "@/src/lib/messages";

import { Channel, realtime } from "@/src/lib/appwrite";

interface ChatWindowProps {
  currentUser: {
    $id: string;
    name: string;
    email: string;
  };

  selectedUser: AppUser;
}

export default function ChatWindow({
  currentUser,
  selectedUser,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversation history
  useEffect(() => {
    async function loadMessages() {
      try {
        setLoading(true);
        setError("");

        const conversation = await getConversationMessages(
          currentUser.$id,
          selectedUser.userId,
        );

        setMessages(conversation);
      } catch (error) {
        console.error(error);
        setError("Failed to load conversation.");
      } finally {
        setLoading(false);
      }
    }

    loadMessages();
  }, [currentUser.$id, selectedUser.userId]);

  // Appwrite Realtime subscription
  useEffect(() => {
    const channel = Channel.tablesdb(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
    )
      .table(process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID!)
      .row()
      .create();

    let subscription:
      | Awaited<ReturnType<typeof realtime.subscribe>>
      | undefined;

    let cancelled = false;

    async function subscribeToMessages() {
      try {
        const newSubscription = await realtime.subscribe(
          channel,
          (response) => {
            const incomingMessage = response.payload as Message;

            const belongsToConversation =
              (incomingMessage.senderId === currentUser.$id &&
                incomingMessage.recipientId === selectedUser.userId) ||
              (incomingMessage.senderId === selectedUser.userId &&
                incomingMessage.recipientId === currentUser.$id);

            if (!belongsToConversation) {
              return;
            }

            setMessages((previousMessages) => {
              const alreadyExists = previousMessages.some(
                (message) => message.$id === incomingMessage.$id,
              );

              if (alreadyExists) {
                return previousMessages;
              }

              return [...previousMessages, incomingMessage];
            });
          },
        );

        // If the component was already unmounted
        // while the subscription was being created
        if (cancelled) {
          await newSubscription.unsubscribe();
          return;
        }

        subscription = newSubscription;
      } catch (error) {
        console.error("Realtime subscription failed:", error);
      }
    }

    subscribeToMessages();

    // Cleanup
    return () => {
      cancelled = true;

      if (subscription) {
        void subscription.unsubscribe();
      }
    };
  }, [currentUser.$id, selectedUser.userId]);

  // Auto-scroll when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const content = messageText.trim();

    // Prevent empty messages
    if (!content) {
      return;
    }

    try {
      setSending(true);
      setError("");

      const newMessage = await sendMessage({
        senderId: currentUser.$id,
        recipientId: selectedUser.userId,
        senderName: currentUser.name,
        content,
      });

      // Add sent message immediately
      setMessages((previousMessages) => {
        const alreadyExists = previousMessages.some(
          (message) => message.$id === newMessage.$id,
        );

        if (alreadyExists) {
          return previousMessages;
        }

        return [...previousMessages, newMessage];
      });

      setMessageText("");
    } catch (error) {
      console.error(error);
      setError("Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  function formatTime(dateString: string) {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-gray-50">
      {/* Header */}
      <div className="shrink-0 border-b bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 font-semibold text-gray-700">
            {selectedUser.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2 className="font-semibold text-gray-900">{selectedUser.name}</h2>

            <p className="text-sm text-gray-500">{selectedUser.email}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 md:px-6">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-gray-500">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="font-medium text-gray-700">No messages yet</p>

              <p className="mt-1 text-sm text-gray-500">
                Send a message to start the conversation.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => {
              const isMine = message.senderId === currentUser.$id;

              return (
                <div
                  key={message.$id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 md:max-w-[65%] ${
                      isMine
                        ? "rounded-br-md bg-black text-white"
                        : "rounded-bl-md bg-white text-gray-900 shadow-sm"
                    }`}
                  >
                    {!isMine && (
                      <p className="mb-1 text-xs font-semibold text-gray-500">
                        {message.senderName}
                      </p>
                    )}

                    <p className="break-words text-sm">{message.content}</p>

                    <p
                      className={`mt-1 text-right text-[11px] ${
                        isMine ? "text-gray-300" : "text-gray-400"
                      }`}
                    >
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="border-t bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="shrink-0 border-t bg-white p-4"
      >
        <div className="flex gap-3">
          <input
            type="text"
            value={messageText}
            onChange={(event) => setMessageText(event.target.value)}
            placeholder={`Message ${selectedUser.name}...`}
            disabled={sending}
            className="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
          />

          <button
            type="submit"
            disabled={sending || !messageText.trim()}
            className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
