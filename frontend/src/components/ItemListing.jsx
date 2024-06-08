"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";
import Link from "next/link";
import { cn, formatPrice } from "@/utils";
import ImageSlider from "./ImageSlider";

export default function ItemListing({ item, index }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 75);

    return () => clearTimeout(timer);
  }, [index]);

  if (!item || !isVisible) return <ItemPlaceholder />;

  if (isVisible && item) {
    return (
      <Link
        className={cn("invisible h-full w-full cursor-pointer group/main", {
          "visible animate-in fade-in-5": isVisible,
        })}
        href={`/items/${item._id.$oid}`}
      >
        <div className="flex flex-col w-full">
          <ImageSlider url={item.image_url} />
          {/* Item title */}
          <h3 className="mt-4 font-medium text-sm text-gray-700">
            {item.title}
          </h3>
          {/* Item description */}
          <p className="mt-1 text-sm text-gray-500">{item.description}</p>
          {/* Item price */}
          <p className="mt-1 font-medium text-sm text-gray-900">
            {formatPrice(item.price)}
          </p>
        </div>
      </Link>
    );
  }

  return;
}

function ItemPlaceholder() {
  return (
    <div className="flex flex-col w-full">
      <div className="relative bg-zinc-100 aspect-square w-full overflow-hidden rounded-xl">
        <Skeleton className="h-full w-full" />
      </div>
      <Skeleton className="mt-4 w-2/3 h-4 rounded-lg" />
      <Skeleton className="mt-2 w-16 h-4 rounded-lg" />
      <Skeleton className="mt-2 w-12 h-4 rounded-lg" />
    </div>
  );
}
