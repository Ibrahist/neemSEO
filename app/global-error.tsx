"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global uncaught application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#ebe7e1] flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-[#f5f1ec] border border-[#ded9d2] rounded-2xl shadow-xl p-8 text-center space-y-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-700">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[#0F3D2E]">Critical System Error</h2>
            <p className="text-sm text-neutral-600 leading-relaxed">
              A fatal error prevented the application from rendering. Please refresh or retry.
            </p>
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F3D2E] text-white text-sm font-medium hover:bg-[#15543f] transition-colors shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Reload Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
