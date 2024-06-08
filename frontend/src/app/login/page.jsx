"use client";

import { Icons } from "@/components/Icons";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/utils";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { login } from "@/api/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Page() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const AuthCredentialsValidator = z.object({
    username: z.string().min(1, {
      message: "Username is required.",
    }),
    password: z.string().min(1, {
      message: "Password is required.",
    }),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(AuthCredentialsValidator),
  });

  const onSubmit = async ({ username, password }) => {
    setIsLoading(true);
    try {
      await login(username, password);
      toast.success("Logged in successfully!");
      router.push("/");
    } catch (error) {
      toast.error("There was a problem logging in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="container relative flex pt-20 flex-col items-center justify-center lg:px-0">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col items-center space-y-2 text-center">
            <Icons.logo className="h-20 w-20" />

            <h1 className="text-2xl font-semibold tracking-tight">
              Log in to your account
            </h1>

            <Link
              href="/signup"
              className={buttonVariants({
                variant: "link",
                className: "gap-1.5",
              })}
            >
              Don&apos;t have an account?
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Log in form */}
          <div className="grid gap-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-2">
                {/* Username */}
                <div className="grid gap-1 py-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    {...register("username")}
                    className={cn({
                      "focus-visible:ring-red-500": errors.username,
                    })}
                    placeholder="Username"
                  />
                  {errors?.username && (
                    <p className="text-sm text-red-500">
                      {errors.username.message}
                    </p>
                  )}
                </div>
                {/* Password */}
                <div className="grid gap-1 py-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    {...register("password")}
                    type="password"
                    className={cn({
                      "focus-visible:ring-red-500": errors.password,
                    })}
                    placeholder="Password"
                  />
                  {errors?.password && (
                    <p className="text-sm text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>
                <Button disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  ) : null}
                  Log In
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
