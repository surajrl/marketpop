import { getCartItems } from "@/api/cart";
import { cn } from "@/utils";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/utils";
import { RemoveFromCartButton } from "@/components/RemoveFromCartButton";
import { CheckoutButton } from "@/components/CheckoutButton";
import { getItemById } from "@/api/item";

export default async function Page() {
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
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Cart
        </h1>
        <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
          <div
            className={cn("lg:col-span-7", {
              "rounded-lg border-2 border-dashed border-zinc-200 p-12":
                items.length === 0,
            })}
          >
            <h2 className="sr-only">Items in your cart</h2>
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center space-y-1">
                <div
                  className="relative mb-4 h-40 w-40 text-muted-foreground"
                  aria-hidden="true"
                >
                  <Image
                    src="/empty-cart.png"
                    fill
                    loading="eager"
                    alt="empty cart"
                  />
                </div>
                <h3 className="font-semibold text-2xl">Your cart is empty</h3>
                <p className="text-muted-foreground text-center">
                  What are you waiting for?
                </p>
              </div>
            ) : null}

            <ul
              className={cn({
                "divide-y divide-gray-200 border-b border-t border-gray-200":
                  items.length > 0,
              })}
            >
              {items.map((item) => {
                return (
                  <li key={item._id.$oid} className="flex py-6 sm:py-10">
                    <div className="flex-shrink-0">
                      <div className="relative h-24 w-24">
                        <Image
                          src={item.image_url}
                          fill
                          className="h-full w-full rounded-md object-cover object-center sm:h-48 sm:w-48"
                          alt="item image"
                        />
                      </div>
                    </div>

                    <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                      <div className="relative pr-9 sm:grid sm_grid-cols-2 sm:gap-x-6  sm:pr-0">
                        <div>
                          <div className="flex justify-between">
                            <h3 className="text-sm">
                              <Link
                                href={`/items/${item._id.$oid}`}
                                className="font-medium text-gray-700 hover:text-gray-800"
                              >
                                {item.title}
                              </Link>
                            </h3>
                          </div>

                          <p className="mt-1 text-sm font-medium text-gray-900">
                            {formatPrice(item.price)}
                          </p>
                        </div>

                        <div className="mt-4 sm:mt-0 sm:pr-9 w-20">
                          <div className="absolute right-0 top-0">
                            <RemoveFromCartButton item={item} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <section className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
            <h2 className="text-lg font-medium text-gray-900">Order summary</h2>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Subtotal</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatPrice(cartTotal)}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <span>Shipping</span>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {formatPrice(shipping)}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <div className="text-base font-medium text-gray-900">
                  Order total
                </div>
                <div className="text-base font-medium text-gray-900">
                  {formatPrice(cartTotal + shipping)}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <CheckoutButton items={items} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
