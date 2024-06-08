"use client";

import { removeFromCart } from "@/api/cart";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { X } from "lucide-react";

export function RemoveFromCartButton({ item }) {
  const router = useRouter();
  return (
    <Button
      aria-label="remove item"
      onClick={async () => {
        try {
          await removeFromCart(item._id.$oid);
          toast.success(`${item.title} removed from cart`);
          router.refresh();
        } catch (err) {
          toast.error(
            "There was a problem removing the item from the cart. Please try again."
          );
        }
      }}
      variant="ghost"
    >
      <X className="h-5 w-5" aria-hidden="true" />
    </Button>
  );
}
