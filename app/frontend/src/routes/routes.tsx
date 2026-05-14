import type { RouteObject } from "react-router";
import { AppShell } from "../layouts/AppShell";
import { HistoryPage } from "@/features/history/HistoryPage";
import { SearchPage } from "@/features/search/SearchPage";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <HistoryPage />,
      },
      {
        path: "search",
        element: <SearchPage />,
      },
    ],
    errorElement: (
      <div className="text-2xl font-bold min-h-screen w-full flex items-center justify-center">
        (404) Page Not Found
      </div>
    ),
  },
];
