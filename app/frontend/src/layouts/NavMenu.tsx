import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Bell } from "lucide-react";
import { MenuSearchBar } from "./SearchBar";

export function NavMenu() {
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
        <NavigationMenuItem>
          <img
            src="https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=Aiden"
            alt="avatar"
            className="size-9 rounded-xl bg-muted ring-1 ring-border transition-shadow hover:ring-primary/50"
          />
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
