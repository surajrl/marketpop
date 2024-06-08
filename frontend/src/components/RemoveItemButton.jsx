"use client";

import { Button } from "./ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { deleteItem } from "@/api/item";

export default function RemoveItemButton({ itemId }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Button
      disabled={isLoading}
      size="lg"
      className="w-full"
      onClick={async () => {
        setIsLoading(true);
        try {
          await deleteItem(itemId);
          toast.success(`Item succesfully removed!`);
          router.push("/");
          router.refresh();
        } catch (error) {
          console.error(error);
          toast.error(
            "There was a problem deleting the item. Please try again."
          );
        } finally {
          setIsLoading(false);
        }
      }}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
      Remove
    </Button>
  );
}
