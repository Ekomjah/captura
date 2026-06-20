import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Bell } from "lucide-react";
import { Link } from "react-router";
import { MenuSearchBar } from "./SearchBar";
import { SignInButton, SignUpButton, useUser } from "@clerk/react";
import { UserAvatar } from "@/components/UserAvatar";

export function NavMenu() {
  const { isSignedIn } = useUser();

  return (
    <NavigationMenu className="z-10">
      <NavigationMenuList className="flex items-center gap-2 sm:gap-3">
        <NavigationMenuItem>
          <MenuSearchBar />
        </NavigationMenuItem>

        <NavigationMenuItem>
          <button
            type="button"
            aria-label="Notifications"
            className="relative flex size-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Bell className="size-4.5" />
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary ring-2 ring-background" />
          </button>
        </NavigationMenuItem>

        {isSignedIn ? (
          <NavigationMenuItem>
            <Link
              to="/dashboard/settings"
              aria-label="Open account settings"
              className="rounded-full outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              <UserAvatar />
            </Link>
          </NavigationMenuItem>
        ) : (
          <>
            <NavigationMenuItem>
              <SignInButton mode="modal">
                <button className="px-3 py-1.5 text-sm font-medium rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                  Sign in
                </button>
              </SignInButton>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <SignUpButton mode="modal">
                <button className="px-3 py-1.5 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                  Sign up
                </button>
              </SignUpButton>
            </NavigationMenuItem>
          </>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
