"use client";

import type { AppUser } from "@/src/types/user";

interface UserListProps {
  users: AppUser[];
  selectedUser: AppUser | null;
  onSelectUser: (user: AppUser) => void;
}

export default function UserList({
  users,
  selectedUser,
  onSelectUser,
}: UserListProps) {
  return (
    <aside className="flex h-full w-full flex-col border-r bg-white">
      <div className="border-b px-5 py-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Users
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Select someone to start chatting
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {users.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-500">
            No other users found.
          </div>
        ) : (
          users.map((user) => {
            const isSelected =
              selectedUser?.userId === user.userId;

            return (
              <button
                key={user.$id}
                type="button"
                onClick={() => onSelectUser(user)}
                className={`mb-1 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition ${
                  isSelected
                    ? "bg-black text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-semibold ${
                    isSelected
                      ? "bg-white text-black"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {user.name}
                  </p>

                  <p
                    className={`truncate text-sm ${
                      isSelected
                        ? "text-gray-300"
                        : "text-gray-500"
                    }`}
                  >
                    {user.email}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}