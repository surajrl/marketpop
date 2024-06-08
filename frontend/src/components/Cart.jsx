import { ShoppingCart } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
  SheetTitle,
  SheetFooter,
} from "./ui/sheet";
import { Separator } from "./ui/separator";
import { formatPrice } from "@/utils";
import Link from "next/link";
import { buttonVariants } from "./ui/button";
import Image from "next/image";
import { ScrollArea } from "./ui/scroll-area";
import { getCartItems } from "@/api/cart";
import { getItemById } from "@/api/item";
import CartItem from "./CartItem";

export default async function Cart() {
  const items = [];
  for (let cartItem of await getCartItems()) {
    let item = await getItemById(cartItem.item_id);
    if (!item) continue;
    items.push(item);
  }

  const shipping = 0;
  const cartTotal =
    items.length > 0 ? items.reduce((total, item) => total + item.price, 0) : 0;

  return (
    <Sheet>
      {/* Cart icon and number of items */}
      <SheetTrigger className="group -m-2 flex items-center p-2">
        <ShoppingCart
          className="h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
          aria-hidden="true"
        />
        <span className="ml-2 text-sm font-medium text-gray-700 group-hover:text-gray-800">
          {items.length}
        </span>
      </SheetTrigger>

      {/* Actual cart list */}
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="space-y-2.5 pr-6">
          <SheetTitle>Cart ({items.length})</SheetTitle>
        </SheetHeader>
        {items.length > 0 ? (
          <>
            {/* Display every cart item */}
            <div className="flex w-full flex-col pr-6">
              <ScrollArea>
                {items.map((item, i) => (
                  <CartItem item={item} key={item._id.$oid} />
                ))}
              </ScrollArea>
            </div>

            {/* Shipping, subtotal price, and checkout */}
            <div className="space-y-4 pr-6">
              <Separator />
              <div className="space-y-1.5 text-sm">
                {/* Shipping price */}
                <div className="flex">
                  <span className="flex-1">Shipping</span>
                  <span>{formatPrice(shipping)}</span>
                </div>

                {/* Subtotal price */}
                <div className="flex">
                  <span className="flex-1">Subtotal</span>
                  <span>{formatPrice(cartTotal + shipping)}</span>
                </div>
              </div>
              <SheetFooter>
                <SheetTrigger asChild>
                  <Link
                    href="/cart"
                    className={buttonVariants({
                      className: "w-full",
                    })}
                  >
                    Proceeed to checkout
                  </Link>
                </SheetTrigger>
              </SheetFooter>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center space-y-1">
            <div
              className="relative mb-4 h-60 w-60 text-muted-foreground"
              aria-hidden="true"
            >
              <Image src="/empty-cart.png" fill alt="empty cart" />
            </div>
            <div className="text-xl font-semibold">Your cart is empty</div>
            <SheetTrigger asChild>
              <Link
                href="/items"
                className={buttonVariants({
                  variant: "link",
                  size: "sm",
                  className: "text-sm text-muted-foreground",
                })}
              >
                Browse Items
              </Link>
            </SheetTrigger>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
