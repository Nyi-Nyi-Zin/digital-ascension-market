import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Loader2,
  Package,
  Receipt,
  ShieldAlert,
  Users,
  WalletCards,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/site/Header";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

const LINKS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package, exact: false },
  { to: "/admin/orders", label: "Orders", icon: Receipt, exact: false },
  { to: "/admin/units", label: "Unit top-ups", icon: WalletCards, exact: false },
  { to: "/admin/analytics", label: "SEO & Analytics", icon: BarChart3, exact: false },
  { to: "/admin/customers", label: "Customers", icon: Users, exact: false },
] as const;

function AdminLayout() {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="glass max-w-md rounded-3xl p-10 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/15">
            <ShieldAlert className="size-6 text-destructive" />
          </span>
          <h1 className="mt-5 text-xl font-bold">Admins only</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This area is restricted to Cloud Nine staff accounts.
          </p>
          <Button asChild variant="hero" className="mt-6">
            <Link to="/products">Back to store</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="glass sticky top-0 z-40 flex shrink-0 items-center gap-3 overflow-x-auto rounded-none p-4 lg:h-screen lg:w-64 lg:flex-col lg:items-stretch lg:gap-2 lg:p-6">
        <Link to="/" className="hidden lg:block">
          <Wordmark />
        </Link>
        <p className="mt-2 hidden text-xs font-bold tracking-widest text-subtle uppercase lg:block">
          Admin
        </p>
        {LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            activeOptions={{ exact: link.exact }}
            className="inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            activeProps={{ className: "gradient-brand text-primary-foreground shadow-glow" }}
          >
            <link.icon className="size-4" />
            {link.label}
          </Link>
        ))}
        <Link
          to="/products"
          className="mt-auto hidden rounded-full px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-primary lg:block"
        >
          ← Back to store
        </Link>
      </aside>

      <main className="flex-1 px-4 py-8 sm:px-8">
        <Outlet />
      </main>
    </div>
  );
}
