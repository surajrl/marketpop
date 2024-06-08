import MaxWidthRapper from "@/components/MaxWidthWrapper";
import { BadgeCheck, Banknote, ShieldCheck } from "lucide-react";
import ItemReel from "@/components/ItemReel";

const perks = [
  {
    name: "Secure Buying & Selling",
    Icon: ShieldCheck,
    description:
      "Interact with people without being afraid of frauds or scams.",
  },
  {
    name: "Guaranteed Quality",
    Icon: BadgeCheck,
    description: "Yes, second-hand and high-quality.",
  },
  {
    name: "Earn Money",
    Icon: Banknote,
    description:
      "Extra cash in just a few minutes, with no need of worrying about the details.",
  },
];

export default function Home() {
  return (
    <>
      <MaxWidthRapper>
        {/* Home landing page */}
        <div className="py-20 mx-auto text-center flex flex-col items-center max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Sell items you do not need anymore and earn some{" "}
            <span className="text-emerald-400">extra cash</span>!
          </h1>
          <p className="mt-6 text-lg max-w-prose text-muted-foreground">
            Welcome to MarketPOP. Buy high quality second-hand items, or sell
            those items you do not use anymore.
          </p>
        </div>

        {/* Item listing */}
        <ItemReel title="Recently Added" href="/items" />
      </MaxWidthRapper>

      {/* Home footer */}
      <section className="border-t border-gray-200 bg-gray-50">
        <MaxWidthRapper className="py-20">
          <div className="grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-0">
            {perks.map((perk) => (
              <div
                key={perk.name}
                className="text-center md:flex md:items-start md:text-left lg:block lg:text-center"
              >
                <div className="md:flex-shrink-0 flex justify-center">
                  <div className="h-16 w-16 flex items-center justify-center rounded-full bg-blue-100 text-blue-900">
                    {<perk.Icon className="w-1/3 h-1/3" />}
                  </div>
                </div>
                <div className="mt-6 md:ml-4 md:mt-0 lg:ml-0 lg:mt-6">
                  <h3 className="text-base font-medium text-gray-900">
                    {perk.name}
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {perk.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </MaxWidthRapper>
      </section>
    </>
  );
}
