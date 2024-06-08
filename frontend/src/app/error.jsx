"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default function Error({ error, reset }) {
  return (
    <main className="grid min-h-full place-items-center px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-emerald-400 dark:text-emerald-500">
          There was an error.
        </p>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
          Something went wrong.
        </h1>

        <p className="mt-6 text-base loading-7 text-zinc-600 dark:text-zinc-400">
          Please try again later or contact support if you are still having
          problems.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button onClick={reset}>Try again</Button>
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            Go back home
          </Link>
        </div>
      </div>
    </main>
  );
}
