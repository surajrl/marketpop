"use server";

import { buttonVariants } from "@/components/ui/button";
import { AuthRequiredError } from "@/exceptions";
import Link from "next/link";

export default async function CustomError({ error, message }) {
  return (
    <main className="grid min-h-full place-items-center px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-emerald-400 dark:text-emerald-500">
          There was an error.
        </p>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
          {error?.message ??
            message ??
            "Something unexpected occurred. Please try again later."}
        </h1>

        <div className="mt-10 flex items-center justify-center gap-x-6">
          {error instanceof AuthRequiredError ? (
            <Link
              href="/login"
              className={buttonVariants({ variant: "default" })}
            >
              Log in
            </Link>
          ) : null}
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            Go back home
          </Link>
        </div>
      </div>
    </main>
  );
}
