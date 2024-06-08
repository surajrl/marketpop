import AddToCartButton from "@/components/AddToCartButton";
import ImageSlider from "@/components/ImageSlider";
import ItemReel from "@/components/ItemReel";
import MaxWidthRapper from "@/components/MaxWidthWrapper";
import { Button } from "@/components/ui/button";
import { getUser, getUserById } from "@/api/auth";
import { getCartItems } from "@/api/cart";
import { getItemById } from "@/api/item";
import { formatPrice } from "@/utils";
import { Shield } from "lucide-react";
import Link from "next/link";
import { createOrGetChat } from "@/api/messages";
import RemoveItemButton from "@/components/RemoveItemButton";
import CustomError from "@/components/CustomError";

export default async function Page({ params }) {
  const BREADCRUMBS = [
    {
      id: 1,
      name: "Home",
      href: "/",
    },
    {
      id: 2,
      name: "Items",
      href: "/items",
    },
  ];

  const item = await getItemById(params.itemId);
  if (!item) return <CustomError message={"Item not found"} />;

  const cartItems = await getCartItems();
  const user = await getUser();
  const seller = await getUserById(item.user_id);
  console.log(seller);

  // Get or create a chat between the logged in user and the seller
  let contactSellerUrl = `/items/${params.itemId}`;
  if (user && user.id !== seller.id) {
    const chat = await createOrGetChat(user.id, seller.id);
    contactSellerUrl = `/dashboard/chat/${chat._id}`;
  }

  return (
    <MaxWidthRapper className="bg-white">
      <div className="bg-white">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
          <div className="lg:max-w-lg lg:self-end">
            {/* Breadcrumbs */}
            <ol className="flex items-center space-x-2">
              {BREADCRUMBS.map((breadcrumb, i) => (
                <li key={breadcrumb.href}>
                  <div className="flex items-center text-sm">
                    <Link
                      href={breadcrumb.href}
                      className="font-medium text-sm text-muted-foreground hover:text-gray-900 "
                    >
                      {breadcrumb.name}
                    </Link>
                    {/* Separator icon between breadcrumbs */}
                    {i !== BREADCRUMBS.length - 1 ? (
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                        className="ml-2 h-5 w-5 flex-shrink-0 text-gray-300"
                      >
                        <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                      </svg>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>

            {/* Item title */}
            <div className="mt-4">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {item.title}
              </h1>
            </div>

            <section className="mt-4">
              {/* Item price */}
              <div className="flex items-center">
                <p className="font-medium text-gray-900">
                  {formatPrice(item.price)}
                </p>
              </div>
              <div className="flex items-center">
                <p className="font-medium text-gray-900">
                  Contact seller:{" "}
                  {seller?.username ?? null ? (
                    <a
                      href={contactSellerUrl}
                      className="font-medium text-blue-600"
                    >
                      {seller.username}
                    </a>
                  ) : (
                    <a href={"/login"} className="font-medium text-blue-600">
                      Log in to contact seller
                    </a>
                  )}
                </p>
              </div>

              {/* Item description */}
              <div className="mt-4 space-y-6">
                <p className="text-base text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </section>
          </div>

          {/* Item images */}
          <div className="mt-10 lg:col-start-2 lg:row-span-2 lg:mt-0 lg_self-center">
            <div className="aspect-square rounded-lg">
              <ImageSlider url={item.image_url} />
            </div>
          </div>

          {/* Check if the user is logged in */}
          {user ? (
            <div className="mt-10 lg:col-start-1 lg:row-start-2 lg:max-w-lg lg:self-start">
              <div>
                {/* Check if the item belongs to the user */}
                {item.user_id === user.id ? (
                  <div className="mt-10">
                    {/* Check if the item has been sold */}
                    {item.status.sold ? (
                      <Button size="lg" className="w-full" disabled={true}>
                        Sold
                      </Button>
                    ) : (
                      <RemoveItemButton itemId={params.itemId} />
                    )}
                  </div>
                ) : (
                  <div className="mt-10">
                    {/* Check if the item has been sold */}
                    {item.status.sold ? (
                      <Button size="lg" className="w-full" disabled={true}>
                        Sold
                      </Button>
                    ) : (
                      <AddToCartButton cartItems={cartItems} item={item} />
                    )}
                  </div>
                )}

                <div className="mt-6 text-center">
                  <div className="group inline-flex text-sm text-medium">
                    <Shield
                      aria-hidden="true"
                      className="mr-2 h-5 w-5 flex-shrink-0 text-gray-400"
                    />
                    <span className="text-muted-foreground hover:text-gray-700">
                      30 Day Return Guarantee
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-10 lg:col-start-1 lg:row-start-2 lg:max-w-lg lg:self-start">
              <div>
                <div className="mt-10">
                  <Button size="lg" className="w-full" disabled={true}>
                    Log In to Buy
                  </Button>
                </div>
                <div className="mt-6 text-center">
                  <div className="group inline-flex text-sm text-medium">
                    <Shield
                      aria-hidden="true"
                      className="mr-2 h-5 w-5 flex-shrink-0 text-gray-400"
                    />
                    <span className="text-muted-foreground hover:text-gray-700">
                      30 Day Return Guarantee
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ItemReel
        href="/items"
        title={"Similar items"}
        subtitle={`Buy similar items to ${item.title}`}
      />
    </MaxWidthRapper>
  );
}
