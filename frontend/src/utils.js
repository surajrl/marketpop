import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price, options) {
  const numericPrice = typeof price === "string" ? parseFloat(price) : price;

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: options?.currency || "GBP",
    notation: options?.notation,
    maximumFractionDigits: 2,
  }).format(numericPrice);
}
