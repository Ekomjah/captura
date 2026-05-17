import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Bell } from "lucide-react";
import { MenuSearchBar } from "./SearchBar";

export function NavMenu() {
  return (
    <NavigationMenu className="p-2 z-10">
      <NavigationMenuList className="flex space-x-4">
        <NavigationMenuItem>
          <MenuSearchBar />
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Bell />
        </NavigationMenuItem>
        <NavigationMenuItem>
          <img
            src="https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=Aiden"
            alt="avatar"
            className="w-10 h-10 rounded-full"
          />
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
