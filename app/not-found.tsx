import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-neutral-50 dark:bg-neutral-950">
      <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mb-2">
        Page Not Found
      </h2>
      <p className="text-sm text-neutral-500 mb-6">
        The requested SEO resource or project page could not be found.
      </p>
      <Link href="/">
        <Button>Return Home</Button>
      </Link>
    </div>
  );
}
