import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenuButton,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router";
import {
  FileSearchCorner,
  Settings,
  Sun,
  Moon,
  MonitorCog,
  History,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useSearch } from "@/context/SearchContext";
import { cn } from "@/lib/utils";
import { CapturaMark } from "@/components/CapturaMark";
import { SidebarAccount } from "./SidebarAccount";

const navItemClass = cn(
  "relative my-0.5 h-10 gap-3 rounded-xl px-3 font-medium text-sidebar-foreground/80 transition-colors",
  "before:absolute before:left-0 before:top-1/2 before:h-0 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-primary before:transition-all",
  "hover:bg-sidebar-accent hover:text-sidebar-foreground",
  "data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:before:h-5",
  "data-[active=true]:[&_svg]:text-primary",
);

export function AppSidebar() {
  const { focusSearch } = useSearch();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const { theme, setTheme } = useTheme();

  const themeButtonClass = (active: boolean) =>
    cn(
      "h-9 flex-1 justify-center rounded-lg transition-colors",
      active
        ? "bg-primary/15 text-primary [&_svg]:text-primary"
        : "text-muted-foreground hover:text-sidebar-foreground",
    );

  return (
    <Sidebar>
      <SidebarHeader className="flex-col items-start justify-center gap-3 border-b border-sidebar-border px-6 pt-7 pb-5">
        <div className="flex items-center gap-3">
          <span className="glow-primary flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <CapturaMark className="size-5.5" />
          </span>
          <div className="flex flex-col">
            <h1 className="font-heading text-2xl font-extrabold tracking-tight leading-none">
              Captura
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Capture library
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <p className="px-6 pt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
          Workspace
        </p>
        <SidebarMenu className="flex gap-0.5 px-3 py-4 w-full">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/dashboard/history")}
              className={navItemClass}
            >
              <Link to="/dashboard/history">
                <History />
                <span>History</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/dashboard/search")}
              onClick={focusSearch}
              className={navItemClass}
            >
              <Link to="/dashboard/search">
                <FileSearchCorner />
                <span>Search</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/dashboard/settings")}
              className={navItemClass}
            >
              <Link to="/dashboard/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarAccount />
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <p className="px-3 pb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
          Appearance
        </p>
        <SidebarMenu className="flex-row gap-1 rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-1">
          <SidebarMenuItem className="flex-1 p-0">
            <SidebarMenuButton
              onClick={() => setTheme("light")}
              isActive={theme === "light"}
              tooltip="Light theme"
              className={themeButtonClass(theme === "light")}
            >
              <Sun />
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem className="flex-1 p-0">
            <SidebarMenuButton
              onClick={() => setTheme("system")}
              isActive={theme === "system"}
              tooltip="System theme"
              className={themeButtonClass(theme === "system")}
            >
              <MonitorCog />
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem className="flex-1 p-0">
            <SidebarMenuButton
              onClick={() => setTheme("dark")}
              isActive={theme === "dark"}
              tooltip="Dark theme"
              className={themeButtonClass(theme === "dark")}
            >
              <Moon />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
