import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold">
          Real-Time Chat App
        </h1>

        <p className="mt-3 text-gray-600">
          Chat with your friends in real time.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/login"
            className="rounded-lg bg-black px-6 py-3 font-medium text-white hover:bg-gray-800"
          >
            Login
          </Link>

          <Link
            href="/signup"
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium hover:bg-gray-50"
          >
            Sign up
          </Link>
        </div>
      </div>
    </main>
  );
}