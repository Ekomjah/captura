import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group";
import { Search } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { useSearch } from "@/context/SearchContext";
import { useState } from "react";

export function MenuSearchBar() {
  const { inputRef } = useSearch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(urlQuery);
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);
  if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery);
    setQuery(urlQuery);
  }

  const handleClick = () => navigate("/search");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchClick();
    }
  };

  const handleSearchClick = () => {
    if (query.trim() !== "") {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };
  return (
    <InputGroup className="w-40 rounded-xl bg-card/60 transition-[box-shadow,border-color,width] duration-300 focus-within:w-56 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/15 sm:w-56 sm:focus-within:w-72">
      <InputGroupInput
        placeholder="Search captures…"
        ref={inputRef}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <InputGroupAddon>
        <Search className="text-muted-foreground" />
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">
        <InputGroupButton variant="outline" onClick={handleSearchClick}>
          Search
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
