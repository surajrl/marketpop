"use client";

import { toast } from "sonner";
import { Button } from "./ui/button";
import { createOrder } from "@/api/order";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function CheckoutButton({ items }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Button
      disabled={items.length === 0 || isLoading}
      className="w-full"
      size="lg"
      onClick={async () => {
        setIsLoading(true);
        try {
          const checkout_session_url = await createOrder(items);
          router.push(checkout_session_url);
        } catch (err) {
          toast.error("There was a problem checking out. Please try again.");
        } finally {
          setIsLoading(false);
        }
      }}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
      Checkout
    </Button>
  );
}
