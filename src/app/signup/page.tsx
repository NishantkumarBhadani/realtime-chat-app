"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { loginUser,registerUser } from "@/src/lib/auth";
import { createUserProfile } from "@/src/lib/users";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      const user = await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      await loginUser({
        email: email.trim(),
        password,
      });

      await createUserProfile(
        user.$id,
        name.trim(),
        email.trim()
      );

      router.replace("/chat");
    } catch (error: unknown) {
      console.error(error);

      if (
        error &&
        typeof error === "object" &&
        "message" in error
      ) {
        setError(String(error.message));
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900">
          Create Account
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Create your account to start chatting.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Name
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your name"
              disabled={loading}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              disabled={loading}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Minimum 8 characters"
              disabled={loading}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black px-4 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-black hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}