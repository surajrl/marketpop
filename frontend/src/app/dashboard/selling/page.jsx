import ItemReel from "@/components/ItemReel";
import MaxWidthRapper from "@/components/MaxWidthWrapper";
import { getUser } from "@/api/auth";
import { getAvailableItemsByUserId } from "@/api/item";
import CustomError from "@/components/CustomError";
import { AuthRequiredError } from "@/exceptions";

export default async function Page() {
  const user = await getUser();
  if (!user) return <CustomError error={AuthRequiredError} />;

  const sellingItems = await getAvailableItemsByUserId(user.id);

  return (
    <MaxWidthRapper>
      <ItemReel title="Selling" items={sellingItems}></ItemReel>
    </MaxWidthRapper>
  );
}
