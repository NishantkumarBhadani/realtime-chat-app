"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getCurrentUser, logoutUser } from "@/src/lib/auth";
import { getAllUsers } from "@/src/lib/users";

import UserList from "@/src/components/chat/UserList";
import ChatWindow from "@/src/components/chat/ChatWindow";

import type { AppUser } from "@/src/types/user";

interface CurrentUser {
  $id: string;
  name: string;
  email: string;
}

export default function ChatPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [users, setUsers] = useState<AppUser[]>([]);

  const [selectedUser, setSelectedUser] =
    useState<AppUser | null>(null);

  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] =
    useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    async function initializeChat() {
      try {
        const user = await getCurrentUser();

        if (!user) {
          router.replace("/login");
          return;
        }

        setCurrentUser({
          $id: user.$id,
          name: user.name,
          email: user.email,
        });

        const allUsers = await getAllUsers();

        const otherUsers = allUsers.filter(
          (item) => item.userId !== user.$id
        );

        setUsers(otherUsers);
      } catch (error) {
        console.error(error);
        setError("Failed to load users.");
      } finally {
        setLoading(false);
        setUsersLoading(false);
      }
    }

    initializeChat();
  }, [router]);

  async function handleLogout() {
    try {
      await logoutUser();
      router.replace("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  function handleSelectUser(user: AppUser) {
    setSelectedUser(user);
  }

  function handleBackToUsers() {
    setSelectedUser(null);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">
          Loading chat...
        </p>
      </main>
    );
  }

  return (
    <main className="flex h-screen flex-col bg-gray-100">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b bg-white px-4 py-3 md:px-6 md:py-4">
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-gray-900 md:text-xl">
            Real-Time Chat
          </h1>

          <p className="truncate text-sm text-gray-500">
            Logged in as {currentUser?.name}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="shrink-0 rounded-lg bg-black px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800 md:px-4"
        >
          Logout
        </button>
      </header>

      {/* Chat Area */}
      <div className="flex min-h-0 flex-1">
        {/* User List */}
        <div
          className={`w-full md:block md:max-w-sm ${
            selectedUser ? "hidden" : "block"
          }`}
        >
          {usersLoading ? (
            <div className="flex h-full items-center justify-center bg-white">
              <p className="text-sm text-gray-500">
                Loading users...
              </p>
            </div>
          ) : (
            <UserList
              users={users}
              selectedUser={selectedUser}
              onSelectUser={handleSelectUser}
            />
          )}
        </div>

        {/* Chat Window */}
        <section
          className={`min-w-0 flex-1 ${
            selectedUser ? "flex" : "hidden"
          } md:flex`}
        >
          {selectedUser && currentUser ? (
            <div className="flex min-h-0 w-full flex-col">
              {/* Mobile Back Button */}
              <div className="border-b bg-white px-4 py-2 md:hidden">
                <button
                  type="button"
                  onClick={handleBackToUsers}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-black"
                >
                  <span className="text-lg">
                    ←
                  </span>
                  Back to users
                </button>
              </div>

              <ChatWindow
                currentUser={currentUser}
                selectedUser={selectedUser}
              />
            </div>
          ) : (
            <div className="hidden flex-1 items-center justify-center md:flex">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  Select a user
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Choose a user from the list to start
                  chatting.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Error */}
      {error && (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-red-600 px-4 py-3 text-sm text-white shadow-lg">
          {error}
        </div>
      )}
    </main>
  );
}