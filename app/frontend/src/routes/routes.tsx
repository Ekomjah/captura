import type { RouteObject } from "react-router";
import { Navigate } from "react-router";
import { AppShell } from "../layouts/AppShell";
import { ProtectedRoute } from "./ProtectedRoute";
import { LandingPage } from "@/features/landing/LandingPage";
import { HistoryPage } from "@/features/components/history/HistoryPage";
import { SearchPage } from "@/features/components/search/SearchPage";
import { SettingsPage } from "@/features/components/settings/SettingsPage";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/dashboard",
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          {
            index: true,
            element: <Navigate to="history" replace />,
          },
          {
            path: "history",
            element: <HistoryPage />,
          },
          {
            path: "search",
            element: <SearchPage />,
          },
          {
            path: "settings",
            element: <SettingsPage />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: (
      <div className="text-2xl font-bold min-h-screen w-full flex items-center justify-center">
        (404) Page Not Found
      </div>
    ),
  },
];
