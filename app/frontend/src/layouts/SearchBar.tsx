import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group";
import { Search } from "lucide-react";

export function MenuSearchBar() {
  return (
    <InputGroup className="max-w-xs">
      <InputGroupInput placeholder="Search..." />
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">
        <InputGroupButton variant="secondary">Search</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
