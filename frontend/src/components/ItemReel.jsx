import Link from "next/link";
import ItemListing from "./ItemListing";
import { getAvailableItems } from "@/api/item";

export default async function ItemReel({ title, subtitle, href, items }) {
  if (!items) {
    items = await getAvailableItems();
  }

  return (
    <section className="py-12">
      <div className="md:flex md:items-center md:justify-between mb-4">
        {/* Left title */}
        <div className="max-w-2xl px-4 lg:max-w-4xl lg:px-0">
          {title ? (
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {title}
            </h1>
          ) : null}
          {subtitle ? (
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>

        {/* Right link */}
        {href ? (
          <Link
            href={href}
            className="hidden text-sm font-medium text-blue-600 hiver:text-bluee-500 md:block"
          >
            View all items <span aria-hidden="true">&rarr;</span>
          </Link>
        ) : null}
      </div>
      {/* List all the individual items */}
      <div className="relative">
        <div className="mt-6 flex items-center w-full">
          <div className="w-full grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4 md:gap-y-10 lg:gap-x-8">
            {items.map((item, i) => (
              <ItemListing key={item._id.$oid} item={item} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
