import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  ShoppingBag,
  Sun,
  WalletCards,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { LanguageSelector } from "@/components/site/LanguageSelector";
import { walletBalanceQuery } from "@/lib/wallet";
import { useTheme } from "@/lib/theme";

const NAV = [
  { to: "/products", key: "products" },
  { to: "/categories", key: "categories" },
  { to: "/faq", key: "faq" },
] as const;

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="flex size-9 items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-white shadow-glow">
        <img src="/assets/cloud-nine-logo.png" alt="" className="size-full object-cover" />
      </span>
      <span className="text-lg font-bold tracking-tight">
        Cloud <span className="gradient-text">Nine</span>
      </span>
    </span>
  );
}

export function Header() {
  const { user, isAdmin } = useAuth();
  const { t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { data: wallet } = useQuery(walletBalanceQuery(user?.id));
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
        <Link to="/" aria-label={t("home")}>
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
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageSelector />
          <Button
            variant="ghost"
            size="icon"
            aria-label={theme === "dark" ? t("switchToLight") : t("switchToDark")}
            title={theme === "dark" ? t("switchToLight") : t("switchToDark")}
            onClick={toggleTheme}
          >
            {theme === "dark" ? <Sun /> : <Moon />}
          </Button>
          {user ? (
            <>
              {isAdmin ? (
                <Button asChild variant="outline" size="sm">
                  <Link to="/admin">
                    <LayoutDashboard /> {t("admin")}
                  </Link>
                </Button>
              ) : null}
              <Button asChild variant="outline" size="sm">
                <Link to="/units">
                                        <WalletCards /> {Number(wallet?.balance ?? 0).toFixed(2)} {t("units")}

                </Link>
              </Button>
              <Button asChild variant="soft" size="sm">
                <Link to="/purchases">
                  <ShoppingBag /> {t("myPurchases")}
                </Link>
              </Button>
              <Button variant="ghost" size="icon" aria-label={t("signOut")} onClick={signOut}>
                <LogOut />
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/auth">{t("signIn")}</Link>
              </Button>
              <Button asChild variant="hero" size="sm">
                <Link to="/auth" search={{ mode: "signup" }}>
                  {t("getStarted")}
                </Link>
              </Button>
            </>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label={t("toggleMenu")}
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
                {t(item.key)}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              <LanguageSelector compact />
              <Button variant="outline" onClick={toggleTheme}>
                {theme === "dark" ? <Sun /> : <Moon />}
                {theme === "dark" ? t("lightMode") : t("darkMode")}
              </Button>
              {user ? (
                <>
                  {isAdmin ? (
                    <Button asChild variant="outline" onClick={() => setOpen(false)}>
                      <Link to="/admin">{t("adminDashboard")}</Link>
                    </Button>
                  ) : null}
                  <Button asChild variant="outline" onClick={() => setOpen(false)}>
                    <Link to="/units">
                    <WalletCards /> {Number(wallet?.balance ?? 0).toFixed(2)} {t("units")}
                    </Link>
                  </Button>
                  <Button asChild variant="soft" onClick={() => setOpen(false)}>
                    <Link to="/purchases">{t("myPurchases")}</Link>
                  </Button>
                  <Button variant="ghost" onClick={signOut}>
                    {t("signOut")}
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" onClick={() => setOpen(false)}>
                    <Link to="/auth">{t("signIn")}</Link>
                  </Button>
                  <Button asChild variant="hero" onClick={() => setOpen(false)}>
                    <Link to="/auth" search={{ mode: "signup" }}>
                      {t("getStarted")}
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
