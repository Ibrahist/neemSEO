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
import { getEnv } from "@/lib/env";

export default function LoginPage() {
  const env = getEnv();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-100 dark:bg-neutral-950">
      <Card className="w-full max-w-md shadow-lg border-neutral-200 dark:border-neutral-800">
        <CardHeader className="text-center">
          <div className="mx-auto h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-xl mb-2">
            N
          </div>
          <CardTitle className="text-2xl font-bold">Sign in to neemSEO</CardTitle>
          <CardDescription>
            {env.AUTH_MODE === "local_noauth"
              ? "Running in local trusted mode (AUTH_MODE=local_noauth)"
              : "Enter your credentials to access your SEO projects"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {env.AUTH_MODE === "local_noauth" ? (
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 text-sm text-emerald-900 dark:text-emerald-200">
              <p className="font-semibold mb-1">Local Development Mode Active</p>
              <p className="text-xs opacity-90">
                You are automatically authenticated as <code>admin@localhost</code>. No login
                required.
              </p>
              <div className="mt-4">
                <Link href="/projects">
                  <Button className="w-full">Continue to Dashboard</Button>
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-4">
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Email
                </label>
                <Input type="email" placeholder="you@domain.com" required />
              </div>
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Password
                </label>
                <Input type="password" placeholder="••••••••" required />
              </div>
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex justify-center border-t border-neutral-100 dark:border-neutral-900 pt-4 text-xs text-neutral-500">
          <span>Need an account? </span>
          <Link href="/register" className="ml-1 text-emerald-600 font-medium hover:underline">
            Sign up
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
