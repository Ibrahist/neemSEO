import { ThemeToggle } from "./theme-toggle";
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
      // Fallback if DB is empty on first boot
      projects = [];
    }
  }

  return (
    <header className="h-16 border-b border-neutral-200 bg-white/80 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-10 dark:border-neutral-800 dark:bg-neutral-950/80">
      <div className="flex items-center gap-4">
        {projects.length > 0 ? (
          <ProjectSwitcher projects={projects} />
        ) : (
          <span className="text-sm font-medium text-neutral-500">No projects yet</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-neutral-200 dark:border-neutral-800">
            <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                {user.name}
              </div>
              <div className="text-[10px] text-neutral-500">{user.email}</div>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
