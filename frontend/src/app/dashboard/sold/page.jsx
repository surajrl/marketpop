import ItemReel from "@/components/ItemReel";
import MaxWidthRapper from "@/components/MaxWidthWrapper";
import { getUser } from "@/api/auth";
import { getSoldItemsByUserId } from "@/api/item";
import CustomError from "@/components/CustomError";
import { AuthRequiredError } from "@/exceptions";

export default async function Page() {
  const user = await getUser();
  if (!user) return <CustomError error={AuthRequiredError} />;

  const soldItems = await getSoldItemsByUserId(user.id);

  return (
    <MaxWidthRapper>
      <ItemReel title="Sold" items={soldItems}></ItemReel>
    </MaxWidthRapper>
  );
}
