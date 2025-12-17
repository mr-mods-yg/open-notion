"use client";
import Link from "next/link";
import { Button } from "./ui/button";

export default function LoginPage({ handleLogin }: { handleLogin: () => void }) {
  return (
    <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
      <div className="max-w-92 m-auto h-fit w-full p-6">
        <div>
          <Link href="/" aria-label="go home">
            Notion
          </Link>
          <h1 className="mb-1 mt-4 text-xl font-semibold">
            Sign In to Notion clone
          </h1>
          <p>Welcome back! Sign in to continue</p>
        </div>

        <div className="mt-6">
          <Button
            type="button"
            onClick={handleLogin}
            variant="outline"
            className="w-full"
          >
            <span>Google</span>
          </Button>
        </div>
      </div>
    </section>
  );
}
