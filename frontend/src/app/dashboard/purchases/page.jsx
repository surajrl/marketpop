import ItemReel from "@/components/ItemReel";
import MaxWidthRapper from "@/components/MaxWidthWrapper";
import { getUser } from "@/api/auth";
import { getItemById } from "@/api/item";
import { getOrderItemsById, getOrdersByUserId } from "@/api/order";
import CustomError from "@/components/CustomError";
import { AuthRequiredError } from "@/exceptions";

export default async function Page() {
  const user = await getUser();
  if (!user) return <CustomError error={AuthRequiredError} />;

  const orders = await getOrdersByUserId(user.id);

  let orderItems = [];
  for (let order of orders) {
    let orderItem = await getOrderItemsById(order.id);
    if (!orderItem) continue;
    orderItems = orderItems.concat(orderItem);
  }

  let purchasedItems = [];
  for (let orderItem of orderItems) {
    let item = await getItemById(orderItem.item_id);
    if (!item) continue;
    purchasedItems = purchasedItems.concat(item);
  }

  return (
    <MaxWidthRapper>
      <ItemReel title="Purchases" items={purchasedItems} />
    </MaxWidthRapper>
  );
}
