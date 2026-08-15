import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Cloud, LayoutDashboard, LogOut, Menu, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

const NAV = [
  { to: "/products", label: "Products" },
  { to: "/categories", label: "Categories" },
  { to: "/faq", label: "FAQ" },
] as const;

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="gradient-brand flex size-9 items-center justify-center rounded-full shadow-glow">
        <Cloud className="size-5 text-primary-foreground" strokeWidth={2.4} />
      </span>
      <span className="text-lg font-bold tracking-tight">
        Cloud <span className="gradient-text">Nine</span>
      </span>
    </span>
  );
}

export function Header() {
  const { user, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--glass-border)] bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" aria-label="Cloud Nine home">
          <Wordmark />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              activeProps={{ className: "bg-accent text-accent-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              {isAdmin ? (
                <Button asChild variant="outline" size="sm">
                  <Link to="/admin">
                    <LayoutDashboard /> Admin
                  </Link>
                </Button>
              ) : null}
              <Button asChild variant="soft" size="sm">
                <Link to="/purchases">
                  <ShoppingBag /> My Purchases
                </Link>
              </Button>
              <Button variant="ghost" size="icon" aria-label="Sign out" onClick={signOut}>
                <LogOut />
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button asChild variant="hero" size="sm">
                <Link to="/auth" search={{ mode: "signup" }}>
                  Get Started
                </Link>
              </Button>
            </>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>

      {open ? (
        <div className="border-t border-[color:var(--glass-border)] bg-background/95 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              {user ? (
                <>
                  {isAdmin ? (
                    <Button asChild variant="outline" onClick={() => setOpen(false)}>
                      <Link to="/admin">Admin dashboard</Link>
                    </Button>
                  ) : null}
                  <Button asChild variant="soft" onClick={() => setOpen(false)}>
                    <Link to="/purchases">My Purchases</Link>
                  </Button>
                  <Button variant="ghost" onClick={signOut}>
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" onClick={() => setOpen(false)}>
                    <Link to="/auth">Sign In</Link>
                  </Button>
                  <Button asChild variant="hero" onClick={() => setOpen(false)}>
                    <Link to="/auth" search={{ mode: "signup" }}>
                      Get Started
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
