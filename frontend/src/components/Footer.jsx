"use client";

import { usePathname } from "next/navigation";
import MaxWidthRapper from "./MaxWidthWrapper";
import { Icons } from "./Icons";
import Link from "next/link";

export default function Footer() {
  const pathsToMinimize = ["/login", "/signup", "/logout", "/items/upload"];
  const pathName = usePathname();
  return (
    <footer className="bg-white flex-grow-0">
      <MaxWidthRapper>
        <div className="py-10 md:flex md:items-center md:justify-between">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} All Rights Reserved
            </p>
          </div>

          <div className="mt-4 flex items-center justify-center md:mt-0">
            <div className="flex space-x-8">
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-gray-600"
              >
                Terms & Conditions
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-gray-600"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-gray-600"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </MaxWidthRapper>
    </footer>
  );
}
