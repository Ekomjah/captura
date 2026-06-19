import { Navigate, Outlet } from "react-router";
import { useAuth } from "@clerk/react";
import { Loader2 } from "lucide-react";

/**
 * Gates the dashboard behind Clerk auth. Waits for Clerk to load before
 * trusting `isSignedIn` (per the @clerk/react mental model), then either
 * renders the nested routes or bounces signed-out visitors to the landing page.
 */
export function ProtectedRoute() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <span className="font-mono text-xs uppercase tracking-[0.2em] flex text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </span>
      </div>
    );
  }

  if (!isSignedIn) return <Navigate to="/" replace />;

  return <Outlet />;
}


