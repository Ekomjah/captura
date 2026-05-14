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
  Images,
  FileSearchCorner,
  Settings,
  Sun,
  Moon,
  MonitorCog,
} from "lucide-react";

export function AppSidebar() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  return (
    <Sidebar>
      <SidebarHeader className="flex-col items-left justify-center border-b px-8 m-0 pt-8">
        <h1 className="text-2xl font-extrabold tracking-tight m-0 p-0">
          Captura
        </h1>
        <p className="font-medium p-0">Technical Precision</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="flex gap-2 pl-4 pr-2 py-4 w-full">
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/")}>
              <Link to="/">
                <Images />
                <div>History</div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/search")}>
              <Link to="/search">
                <FileSearchCorner />
                <div>Search</div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/settings")}>
              <Link to="/settings">
                <Settings />
                <div>Settings</div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t pt-4">
        <SidebarMenu className="flex-row border rounded-lg gap-2 w-full justify-evenly">
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Sun />
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <MonitorCog />
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Moon />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
