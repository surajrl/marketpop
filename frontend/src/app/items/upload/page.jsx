"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createItem } from "@/api/item";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function Page() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const UploadItemValidator = z.object({
    title: z.string().min(1, {
      message: "A title for the item is required.",
    }),
    description: z.string().min(1, {
      message: "An item description is required.",
    }),
    price: z
      .string({ message: "Invalid price." })
      .regex(/^\d+(\.\d{1,2})?$/, { message: "Invalid price." })
      .refine((value) => parseFloat(value) > 0, {
        message: "Invalid price.",
      }),
    image: z.any(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(UploadItemValidator),
  });

  const onSubmit = async (formData) => {
    setIsLoading(true);
    try {
      const formDataToUpload = new FormData();
      const imageFile = formData.image[0];
      if (!imageFile) throw new Error("Image is required.");
      formDataToUpload.append("image", imageFile);
      formDataToUpload.append("title", formData.title);
      formDataToUpload.append("description", formData.description);
      formDataToUpload.append("price", formData.price);

      await createItem(formDataToUpload);
      toast.success("Item created successfully!");
      router.push("/");
      router.refresh();
    } catch (error) {
      toast.error("There was a problem creating the item. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="container relative flex pt-20 flex-col items-center justify-center lg:px-0">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col items-center space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Upload Item
            </h1>
          </div>

          {/* Item form */}
          <div className="grid gap-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-2">
                {/* Title */}
                <div className="grid gap-1 py-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    {...register("title")}
                    className={cn({
                      "focus-visible:ring-red-500": errors.title,
                    })}
                  />
                  {errors?.title && (
                    <p className="text-sm text-red-500">
                      {errors.title.message}
                    </p>
                  )}
                </div>
                {/* Description */}
                <div className="grid gap-1 py-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    {...register("description")}
                    className={cn({
                      "focus-visible:ring-red-500": errors.description,
                    })}
                  />
                  {errors?.description && (
                    <p className="text-sm text-red-500">
                      {errors.description.message}
                    </p>
                  )}
                </div>
                {/* Price */}
                <div className="grid gap-1 py-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    {...register("price")}
                    className={cn({
                      "focus-visible:ring-red-500": errors.price,
                    })}
                  />
                  {errors?.price && (
                    <p className="text-sm text-red-500">
                      {errors.price.message}
                    </p>
                  )}
                </div>
                {/* Image */}
                <div className="grid gap-1 py-2">
                  <Label htmlFor="image">Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="images/*"
                    {...register("image")}
                    className={cn({
                      "focus-visible:ring-red-500": errors.image,
                    })}
                  />
                  {errors?.image && (
                    <p className="text-sm text-red-500">
                      {errors.image.message}
                    </p>
                  )}
                </div>
                {/* Submit */}
                <Button disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  ) : null}
                  Sell!
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
