import Link from "next/link";
import MaxWidthRapper from "./MaxWidthWrapper";
import { Icons } from "./Icons";
import { buttonVariants } from "./ui/button";
import Cart from "./Cart";
import { BadgePlus } from "lucide-react";
import UserAccount from "./UserAccount";
import { getUser } from "@/api/auth";

export default async function NavBar() {
  const user = await getUser();

  return (
    <div className="bg-white sticky z-50 top-0 inset-x-0 h-16">
      <header className="relative bg-white">
        <MaxWidthRapper>
          <div className="border-b border-gray-200">
            <div className="flex h-16 items-center">
              {/* Left logo */}
              <div className="ml-4 flex lg:ml-0">
                <Link href="/">
                  <Icons.logo className="h-10 w-10" />
                </Link>
              </div>

              {/* Right side */}
              <div className="ml-auto flex items-center">
                <div className="flex flex-1 items-center justify-end space-x-6">
                  {/* Log in or upload item*/}
                  {user ? (
                    <Link
                      href="/items/upload"
                      className={buttonVariants({ variant: "ghost" })}
                    >
                      <BadgePlus
                        className="h-6 w-6 flex-shrink-0 group-hover:text-gray-500"
                        aria-hidden="true"
                      />
                      <span className="ml-2">Sell</span>
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      className={buttonVariants({ variant: "ghost" })}
                    >
                      Log In
                    </Link>
                  )}

                  <span className="h-6 w-px bg-gray-200" aria-hidden="true" />

                  {/* Sign up or allow user to view his account */}
                  {user ? (
                    <UserAccount />
                  ) : (
                    <Link
                      href="/signup"
                      className={buttonVariants({ variant: "ghost" })}
                    >
                      Sign Up
                    </Link>
                  )}

                  {user ? (
                    <span className="h-6 w-px bg-gray-200" aria-hidden="true" />
                  ) : null}

                  {/* User logged in */}
                  {user ? null : (
                    <div className="flex lg:ml-6">
                      <span
                        className="h-6 w-px bg-gray-200"
                        aria-hidden="true"
                      />
                    </div>
                  )}

                  {/* Cart */}
                  <div className="ml-4 flow-root lg:ml-6">
                    <Cart />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MaxWidthRapper>
      </header>
    </div>
  );
}
