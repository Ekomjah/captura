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
    <InputGroup className="max-w-xs">
      <InputGroupInput
        placeholder="Search..."
        ref={inputRef}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">
        <InputGroupButton variant="outline" onClick={handleSearchClick}>
          Search
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
