"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { logout } from "@/api/auth";
import { DropdownMenuItem } from "./ui/dropdown-menu";

export default function LogOutButton() {
  const router = useRouter();

  return (
    <DropdownMenuItem
      onClick={async () => {
        try {
          await logout();
          toast.success("Logged out successfully!");
          router.push("/");
        } catch (error) {
          toast.error("There was a problem logging out. Please try again.");
        }
      }}
      className="cursor-pointer"
    >
      Log Out
    </DropdownMenuItem>
  );
}
