import PaymentStatus from "@/components/PaymentStatus";
import { getOrderById, getOrderItemsById } from "@/api/order";
import { formatPrice } from "@/utils";
import Image from "next/image";
import Link from "next/link";
import { getItemById } from "@/api/item";

export default async function Page({ searchParams }) {
  const order = await getOrderById(searchParams.orderId);

  const items = [];
  for (let orderItem of await getOrderItemsById(searchParams.orderId)) {
    let item = await getItemById(orderItem.item_id);
    if (!item) continue;
    items.push(item);
  }

  const shipping = 0;
  const subtotal =
    items.length > 0 ? items.reduce((total, item) => total + item.price, 0) : 0;

  return (
    <main className="relative lg:min-h-full">
      <div className="hidden lg:block h-80 overflow-hidden lg:absolute lg:h-full lg:w-1/2 lg:pr-4 xl:pr-12">
        <Image
          fill
          src="/checkout-success.jpg"
          className="h-full w-full object-cover object-center"
          alt="thank you for your order"
        />
      </div>

      <div>
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-32 xl:gap-x-24">
          <div className="lg:col-start-2">
            <p className="text-sm font-medium text-blue-600">
              Order successful
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Thanks for your order
            </h1>
            {order.status == 2 ? (
              <p className="mt-2 text-base text-muted-foreground">
                Your order was processed and will arrive soon. You can check the
                status of the order in{" "}
                <Link
                  href="/dashboard/purchases"
                  className="font-medium text-blue-600"
                >
                  Purchases
                </Link>
                .
              </p>
            ) : (
              <p className="mt-2 text-base text-muted-foreground">
                We&apos;re currently processing your order. We&apos;ll send you
                a confirmation once this is done.
              </p>
            )}

            <div className="mt-16 text-sm font-medium">
              <div className="text-muted-foreground">Order nr.</div>
              <div className="mt-2 text-gray-900">{order.id}</div>

              <ul className="mt-6 divide-y divide-gray-200 border-t border-gray-200 text-sm font-medium text-muted-foreground">
                {items.map((item) => {
                  return (
                    <li key={item._id.$oid} className="flex space-x-6 py-6">
                      <div className="relative h-24 w-24">
                        <Image
                          fill
                          src={item.image_url}
                          alt={`${item.title} image`}
                          className="flex-none rounded-md bg-gray-100 object-cover object-center"
                        />
                      </div>

                      <div className="flex-auto flex flex-col justify-between">
                        <div className="space-y-1">
                          <h3 className="text-gray-900">{item.title}</h3>
                        </div>
                      </div>

                      <p className="flex-none font-medium text-gray-900">
                        {formatPrice(item.price)}
                      </p>
                    </li>
                  );
                })}
              </ul>

              <div className="space-y-6 border-t border-gray-200 pt-6 text-sm font-medium text-muted-foreground">
                <div className="flex justify-between">
                  <p>Subtotal</p>
                  <p className="text-gray-900">{formatPrice(subtotal)}</p>
                </div>

                <div className="flex justify-between">
                  <p>Shipping</p>
                  <p className="text-gray-900">{formatPrice(shipping)}</p>
                </div>

                <div className="flex items-center justify-between border-t border-gray-200 pt-6 text-gray-900">
                  <p className="text-base">Order total</p>
                  <p className="text-base">
                    {formatPrice(subtotal + shipping)}
                  </p>
                </div>
              </div>

              <PaymentStatus />

              <div className="mt-16 border-t border-gray-200 py-6 text-right">
                <Link
                  href="/items"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Continue shopping &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
