import { useState } from "react";
import { Link } from "react-router";
import { useClerk, useUser } from "@clerk/react";
import { ChevronDown, ChevronUp, LogOut, Settings, Tag } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { UserAvatar } from "@/components/UserAvatar";
import { cn } from "@/lib/utils";

export function SidebarAccount() {
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);

  if (!isSignedIn || !user) return null;

  const fullName = user.fullName ?? user.username ?? "Account";
  const email = user.primaryEmailAddress?.emailAddress ?? "";

  return (
    <div className="border-t border-sidebar-border px-3 py-3">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="sidebar-account-panel"
            className="h-12 gap-3 rounded-xl px-3 hover:bg-sidebar-accent"
          >
            <UserAvatar sizeClass="size-8" />
            <span className="flex min-w-0 flex-1 flex-col items-start text-left">
              <span className="truncate text-sm font-medium leading-tight">
                {fullName}
              </span>
              {email && (
                <span className="truncate text-[11px] text-muted-foreground leading-tight">
                  {email}
                </span>
              )}
            </span>
            {open ? (
              <ChevronUp className="size-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="size-4 text-muted-foreground" />
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      <div
        id="sidebar-account-panel"
        hidden={!open}
        className={cn(
          "mt-1 space-y-0.5",
          open && "animate-fade-in",
        )}
      >
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-9 gap-3 rounded-lg px-3 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent"
            >
              <Link to="/dashboard/settings">
                <Settings className="size-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              disabled
              aria-disabled="true"
              className="h-9 cursor-not-allowed gap-3 rounded-lg px-3 text-sm text-muted-foreground/70 opacity-70"
            >
              <Tag className="size-4" />
              <span className="flex-1">Pricing</span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                Coming soon
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut({ redirectUrl: "/" })}
              className="h-9 gap-3 rounded-lg px-3 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="size-4" />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
    </div>
  );
}
