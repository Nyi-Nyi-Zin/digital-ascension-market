import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { CategoryIcon } from "@/components/site/ProductCard";
import { categoriesQuery, productsQuery } from "@/lib/marketplace";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — Cloud Nine" },
      {
        name: "description",
        content:
          "Explore Cloud Nine categories: AI subscriptions, design tools, virtual cards and streaming accounts.",
      },
      { property: "og:title", content: "Categories — Cloud Nine" },
      {
        property: "og:description",
        content: "AI subscriptions, design tools, virtual cards and streaming accounts.",
      },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(categoriesQuery),
      context.queryClient.ensureQueryData(productsQuery),
    ]);
  },
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const { data: products } = useSuspenseQuery(productsQuery);
  const { t } = useI18n();

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h1 className="text-3xl font-extrabold sm:text-4xl">{t("categories")}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{t("liveStock")}</p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {categories.map((cat) => {
            const count = products.filter((p) => p.category_id === cat.id).length;
            return (
              <Link
                key={cat.id}
                to="/products"
                className="glass lift flex items-center justify-between gap-4 rounded-3xl p-7"
              >
                <span className="flex items-center gap-4">
                  <span className="gradient-brand flex size-12 items-center justify-center rounded-full shadow-glow">
                    <CategoryIcon name={cat.icon} className="size-5 text-primary-foreground" />
                  </span>
                  <span>
                    <span className="block text-base font-semibold">{cat.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {count} {t("products")}
                    </span>
                  </span>
                </span>
                <ArrowRight className="size-5 text-primary" />
              </Link>
            );
          })}
        </div>
      </div>
    </SiteLayout>
  );
}
