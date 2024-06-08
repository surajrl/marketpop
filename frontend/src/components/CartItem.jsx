"use client";

import { removeFromCart } from "@/api/cart";
import { formatPrice } from "@/utils";
import { X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CartItem({ item }) {
  const router = useRouter();

  return (
    <div className="space-y-3 py-2">
      <div className="flex items-start justify-between gap-4">
        {/* Item image */}
        <div className="flex items-center space-x-4">
          <div className="relative aspect-square h-16 w-16 min-w-fit overflow-hidden rounded">
            <Image
              src={item.image_url}
              alt={item.title}
              fill
              className="absolute object-cover"
            />
          </div>

          <div className="flex flex-col self-start">
            {/* Item title */}
            <span className="line-clamp-1 text-sm font-medium mb-1">
              {item.title}
            </span>

            {/* Remove item from the cart */}
            <div className="mt-4 text-xs text-muted-foreground">
              <form
                action={async () => {
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
              >
                <button className="flex items-center gap-0.5">
                  <X className="w-3 h-4" />
                  Remove
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-1 font-medium">
          <span className="ml-auto line-clamp-1 text-sm">
            {formatPrice(item.price)}
          </span>
        </div>
      </div>
    </div>
  );
}
