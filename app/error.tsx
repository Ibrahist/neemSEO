"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#ebe7e1] flex items-center justify-center p-4 font-sans selection:bg-[#8CC63F]/30 selection:text-[#0F3D2E]">
      <div className="w-full max-w-md bg-[#f5f1ec] border border-[#ded9d2] rounded-2xl shadow-xl p-6 sm:p-8 text-center space-y-6">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[#0F3D2E]">Something went wrong</h2>
          <p className="text-sm text-neutral-600 leading-relaxed">
            An unexpected error occurred while processing this request. Your data has not been
            affected.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F3D2E] text-white text-sm font-medium hover:bg-[#15543f] transition-colors shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#ded9d2] bg-white text-neutral-700 text-sm font-medium hover:bg-neutral-50 transition-colors shadow-xs"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
