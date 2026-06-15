import { Outlet, useLocation } from "react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSideBar";
import { NavMenu } from "./NavMenu";
import { Toaster } from "sonner";
import { SearchProvider } from "@/context/SearchContext";

export function AppShell() {
  const location = useLocation();

  return (
    <SearchProvider>
      <SidebarProvider>
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between gap-3 border-b border-border/60 bg-background/70 px-4 backdrop-blur-xl after:absolute after:inset-x-0 after:-bottom-px after:h-px after:bg-gradient-to-r after:from-transparent after:via-primary/40 after:to-transparent">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <span className="hidden items-center gap-2 sm:flex">
                <span className="size-1.5 rounded-full bg-primary animate-glow" />
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Captura
                </span>
              </span>
            </div>
            <NavMenu />
          </header>
          <main className="flex-1 overflow-auto">
            <div key={location.pathname} className="animate-fade-in">
              <Outlet />
            </div>
          </main>
          <Toaster position="top-center" richColors />
        </div>
      </SidebarProvider>
    </SearchProvider>
  );
}
