import { Outlet, Link, useLocation } from "react-router";
import "./AppShell.css";
import { cn } from "@/lib/utils";

export function AppShell() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>Captura</h1>
        </div>
        <nav className="sidebar-nav">
          <Link to="/" className={cn("nav-link", { active: isActive("/") })}>
            Gallery
          </Link>
          <Link
            to="/search"
            className={cn("nav-link", { active: isActive("/search") })}
          >
            Search
          </Link>
        </nav>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
