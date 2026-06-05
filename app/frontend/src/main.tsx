import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import "./index.css";
import { routes } from "./routes/routes";
import { ThemeProvider } from "@/context/ThemeContext";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const router = createBrowserRouter(routes);
const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools />
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
      <SpeedInsights />
      <Analytics />
    </QueryClientProvider>
  </StrictMode>,
);
