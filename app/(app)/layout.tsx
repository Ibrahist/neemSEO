import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/marketing/navbar";
import { getCurrentUser } from "@/lib/auth/session";
import { listProjects } from "@/features/projects/service";
import type { ProjectRecord } from "@/features/projects/repository";
import { redirect } from "next/navigation";
import { getEnv } from "@/lib/env";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const env = getEnv();

  if (!user && env.AUTH_MODE !== "local_noauth") {
    redirect("/login");
  }

  let projects: ProjectRecord[] = [];

  if (user?.organizationId) {
    try {
      projects = await listProjects(user.organizationId);
    } catch {
      projects = [];
    }
  }

  return (
    <div className="min-h-screen bg-[#ebe7e1] py-2 sm:py-4 md:py-6 px-1 sm:px-3 md:px-5 flex justify-center items-start font-sans selection:bg-[#8CC63F]/30 selection:text-[#0F3D2E]">
      {/* Boxed Platform Container matching Homepage styling */}
      <div className="w-full max-w-[1520px] bg-[#f5f1ec] border border-[#ded9d2] rounded-2xl sm:rounded-3xl shadow-xl shadow-neutral-900/5 overflow-hidden flex flex-col min-h-[96vh]">
        {/* Strictly One Top Header with Only Logo & Name */}
        <Navbar minimal={true} />

        {/* Platform Body with Sidebar & Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#f5f1ec]">
          <Sidebar projects={projects} />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#f5f1ec]">
              <div className="max-w-7xl mx-auto space-y-6">{children}</div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
