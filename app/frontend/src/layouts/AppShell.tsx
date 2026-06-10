import { Outlet } from "react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSideBar";
import { NavMenu } from "./NavMenu";
import { Toaster } from "sonner";
import { SearchProvider } from "@/context/SearchContext";
export function AppShell() {
  return (
    <SearchProvider>
      <SidebarProvider>
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-center border-b px-4 sticky top-0 w-full z-10 bg-background h-16">
            <SidebarTrigger />
            <h2 className="font-mono text-sm font-medium uppercase tracking-[0.2em] text-foreground">
              Captura
            </h2>
            <NavMenu />
          </div>
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
          <Toaster position="top-center" />
        </div>
      </SidebarProvider>
    </SearchProvider>
  );
}
