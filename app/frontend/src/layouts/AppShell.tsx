import { Outlet } from "react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSideBar";
import { NavMenu } from "./NavMenu";
import { Toaster } from "sonner";
export function AppShell() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center border-b px-4 sticky top-0 w-full z-10 bg-background h-16">
          <SidebarTrigger />
          <h2 className="text-lg font-semibold">Captura</h2>
          <NavMenu />
        </div>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
        <Toaster position="top-center" />
      </div>
    </SidebarProvider>
  );
}
