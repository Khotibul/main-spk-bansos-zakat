"use client";
import type { Users } from "@/api/auth/signup/type";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Ribbon, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export function SignupForm() {
  const { register, handleSubmit, setValue, watch } = useForm<Users>();
  const wRole = watch("role");
  const router = useRouter();

  async function onSubmit(data: Users) {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    // --- Aman dari error JSON parse
    let result = null;
    try {
      const text = await response.text();
      result = text ? JSON.parse(text) : null;
    } catch (e) {
      console.warn("Response signup bukan JSON:", e);
    }

    router.refresh(); // refresh cache
    router.push("/"); // pindah halaman, bukan redirect()
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <div className="flex gap-3 mb-4">
          <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Ribbon className="size-5" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="-ml-[0.1rem] truncate font-semibold">
              SIBANDES
            </span>
            <span className="truncate text-xs">SI Bantuan Desa</span>
          </div>
        </div>
        <CardTitle className="text-2xl">Sign up</CardTitle>
        <CardDescription>
          Create an account, let us know who you are.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required {...register("email")} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                minLength={3}
                required
                {...register("username")}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                {...register("password")}
              />
            </div>

            <Label className="-mb-2">Role</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => setValue("role", "KEPALA_DESA")}
                variant={wRole === "KEPALA_DESA" ? "default" : "outline"}
                className="flex-1"
              >
                <GraduationCap />
                Kepala Desa
              </Button>

              <Button
                type="button"
                onClick={() => setValue("role", "PERANGKAT_DESA")}
                variant={wRole === "PERANGKAT_DESA" ? "default" : "outline"}
                className="flex-1"
              >
                <UsersRound />
                Perangkat Desa
              </Button>
            </div>

            <div className="mt-3 text-center">
              <Link
                href="/warga/cek-kelayakan"
                className="text-sm text-blue-600 hover:underline"
              >
                Cek Kelayakan Bantuan (Untuk Warga)
              </Link>
            </div>

            <Button type="submit" className="w-full">
              Sign up
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
