import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-100 dark:bg-neutral-950">
      <Card className="w-full max-w-md shadow-lg border-neutral-200 dark:border-neutral-800">
        <CardHeader className="text-center">
          <div className="mx-auto h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-xl mb-2">
            N
          </div>
          <CardTitle className="text-2xl font-bold">Create your Account</CardTitle>
          <CardDescription>Get started with self-hosted neemSEO</CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-4">
            <div className="space-y-1 text-left">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Full Name
              </label>
              <Input type="text" placeholder="Ada Lovelace" required />
            </div>
            <div className="space-y-1 text-left">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Email
              </label>
              <Input type="email" placeholder="ada@domain.com" required />
            </div>
            <div className="space-y-1 text-left">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Password
              </label>
              <Input type="password" placeholder="••••••••" required />
            </div>
            <Button type="submit" className="w-full">
              Create Account
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-neutral-100 dark:border-neutral-900 pt-4 text-xs text-neutral-500">
          <span>Already have an account? </span>
          <Link href="/login" className="ml-1 text-emerald-600 font-medium hover:underline">
            Sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
