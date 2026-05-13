import type { RouteObject } from "react-router-dom";
import { AppShell } from "../layouts/AppShell";
import { GalleryPage } from "../features/gallery/GalleryPage";
import { SearchPage } from "../features/search/SearchPage";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <GalleryPage />,
      },
      {
        path: "search",
        element: <SearchPage />,
      },
    ],
  },
];
