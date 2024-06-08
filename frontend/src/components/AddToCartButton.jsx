"use client";

import { Button } from "./ui/button";
import { addToCart } from "@/api/cart";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function AddToCartButton({ cartItems, item }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Button
      disabled={
        isLoading ||
        cartItems.some((cartItem) => cartItem.item_id === item._id.$oid)
      }
      size="lg"
      className="w-full"
      onClick={async () => {
        setIsLoading(true);
        try {
          await addToCart(item._id.$oid);
          toast.success(`${item.title} added to cart`);
          router.refresh();
        } catch (err) {
          toast.error(
            "There was a problem adding the item to the cart. Please try again."
          );
        } finally {
          setIsLoading(false);
        }
      }}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
      Add to cart
    </Button>
  );
}
