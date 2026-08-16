import { Link } from "@tanstack/react-router";
import { Wordmark } from "./Header";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="mt-24 border-t border-[color:var(--glass-border)] bg-background/60 backdrop-blur-xl">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Wordmark />
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Cloud Nine is a curated marketplace for digital subscriptions, design tools, virtual
            cards and streaming accounts — paid locally, delivered instantly.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold">{t("marketplace")}</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/products" className="hover:text-primary">
                {t("allProducts")}
              </Link>
            </li>
            <li>
              <Link to="/categories" className="hover:text-primary">
                {t("categories")}
              </Link>
            </li>
            <li>
              <Link to="/purchases" className="hover:text-primary">
                {t("myPurchases")}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold">{t("support")}</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/faq" className="hover:text-primary">
                {t("faq")}
              </Link>
            </li>
            <li>KBZPay · WavePay · Bank</li>
            <li>support@cloudnine.store</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[color:var(--glass-border)] px-4 py-6 text-center text-xs text-subtle">
        © {new Date().getFullYear()} Cloud Nine. {t("allRightsReserved")}
      </div>
    </footer>
  );
}
