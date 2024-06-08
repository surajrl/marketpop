import Link from "next/link";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { getUser } from "@/api/auth";
import LogOutButton from "./LogOutButton";

export default async function UserAccount() {
  const user = await getUser();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="overflow-visible">
        <Button variant="ghost" size="sm" className="relative">
          My Account
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="bg-white w-60" algin="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-0.5 leading-none">
            <p className="font-medium text-sm text-black">
              {user ? user.username : null}
            </p>
          </div>
        </div>

        <DropdownMenuItem asChild>
          <Link href="/dashboard/purchases">Purchases</Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/dashboard/selling">Selling</Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/dashboard/sold">Sold</Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/dashboard/chat">Chat</Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <LogOutButton />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
