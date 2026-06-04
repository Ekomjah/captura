import { createContext, useContext, useRef } from "react";

type SearchContextType = {
  inputRef: React.RefObject<HTMLInputElement | null>;
  focusSearch: () => void;
};

const SearchContext = createContext<SearchContextType | null>(null);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const focusSearch = () => {
    inputRef.current?.focus();
  };

  return (
    <SearchContext.Provider value={{ inputRef, focusSearch }}>
      {children}
    </SearchContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSearch = () => {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used within SearchProvider");
  return ctx;
};
