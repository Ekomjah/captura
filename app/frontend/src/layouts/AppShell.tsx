import { Outlet, Link, useLocation } from "react-router-dom";
import "./AppShell.css";

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
          <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>
            Gallery
          </Link>
          <Link
            to="/search"
            className={`nav-link ${isActive("/search") ? "active" : ""}`}
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
