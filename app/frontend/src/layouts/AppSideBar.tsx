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

export function AppSidebar() {
  const { focusSearch } = useSearch();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const { theme, setTheme } = useTheme();
  return (
    <Sidebar>
      <SidebarHeader className="flex-col items-left justify-center border-b px-7 m-0 pt-8 pb-6">
        <h1 className="font-display text-4xl leading-none tracking-tight m-0 p-0 text-text-display">
          Captura
        </h1>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.08em] text-text-secondary p-0">
          Technical Precision
        </p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="flex gap-2 pl-4 pr-2 py-4 w-full">
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/")}>
              <Link to="/">
                <History />
                <div className="font-mono text-xs uppercase tracking-[0.08em]">
                  History
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/search")}
              onClick={focusSearch}
            >
              <Link to="/search">
                <FileSearchCorner />
                <div className="font-mono text-xs uppercase tracking-[0.08em]">
                  Search
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/settings")}>
              <Link to="/settings">
                <Settings />
                <div className="font-mono text-xs uppercase tracking-[0.08em]">
                  Settings
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t pt-4">
        <SidebarMenu className="flex-row border rounded-lg gap-2 w-full justify-evenly">
          <SidebarMenuItem className="p-0">
            <SidebarMenuButton
              onClick={() => setTheme("light")}
              isActive={theme === "light"}
              tooltip="Light theme"
            >
              <Sun />
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem className="p-0">
            <SidebarMenuButton
              onClick={() => setTheme("system")}
              isActive={theme === "system"}
              tooltip="System theme"
            >
              <MonitorCog />
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem className="p-0">
            <SidebarMenuButton
              onClick={() => setTheme("dark")}
              isActive={theme === "dark"}
              tooltip="Dark theme"
            >
              <Moon />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
