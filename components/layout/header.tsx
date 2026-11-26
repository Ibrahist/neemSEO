import { ProjectSwitcher } from "./project-switcher";
import { getCurrentUser } from "@/lib/auth/session";
import { listProjects } from "@/features/projects/service";
import type { ProjectRecord } from "@/features/projects/repository";

export async function Header() {
  const user = await getCurrentUser();
  let projects: ProjectRecord[] = [];

  if (user?.organizationId) {
    try {
      projects = await listProjects(user.organizationId);
    } catch {
      projects = [];
    }
  }

  return (
    <header className="h-16 border-b border-[#ded9d2] bg-[#f5f1ec]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4">
        {projects.length > 0 ? (
          <ProjectSwitcher projects={projects} />
        ) : (
          <span className="text-sm font-semibold text-[#0F3D2E]">Platform Dashboard</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8CC63F]/20 border border-[#8CC63F]/40 text-[#0F3D2E] text-xs font-semibold">
          <span className="h-2 w-2 rounded-full bg-[#8CC63F]" />
          <span>100% Free Access</span>
        </div>

        <div className="flex items-center gap-2.5 pl-3 border-l border-[#ded9d2]">
          <div className="h-8 w-8 rounded-full bg-[#0F3D2E] text-white flex items-center justify-center text-xs font-bold shadow-xs">
            F
          </div>
          <div className="text-left hidden md:block">
            <div className="text-xs font-bold text-[#0F3D2E]">Free Workspace</div>
            <div className="text-[10px] text-neutral-500">No Login Required</div>
          </div>
        </div>
      </div>
    </header>
  );
}
