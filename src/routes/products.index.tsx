import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { CategoryIcon, ProductCard } from "@/components/site/ProductCard";
import { categoriesQuery, productsQuery, stockCountsQuery } from "@/lib/marketplace";

export const Route = createFileRoute("/products/")({
  head: () => ({
    meta: [
      { title: "All Products — Cloud Nine" },
      {
        name: "description",
        content:
          "Browse every Cloud Nine digital product: AI subscriptions, design tools, virtual cards and streaming accounts with live stock counts.",
      },
      { property: "og:title", content: "All Products — Cloud Nine" },
      {
        property: "og:description",
        content: "Every digital product on Cloud Nine, with live stock availability.",
      },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(categoriesQuery),
      context.queryClient.ensureQueryData(productsQuery),
      context.queryClient.ensureQueryData(stockCountsQuery),
    ]);
  },
  component: ProductsPage,
});

function ProductsPage() {
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const { data: products } = useSuspenseQuery(productsQuery);
  const { data: stock } = useSuspenseQuery(stockCountsQuery);
  const [active, setActive] = useState("all");

  const visible = active === "all" ? products : products.filter((p) => p.category_id === active);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h1 className="text-3xl font-extrabold sm:text-4xl">
          All <span className="gradient-text">products</span>
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
          Every product is stocked with real credentials and delivered as soon as your payment is
          verified.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          <button
            onClick={() => setActive("all")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
              active === "all"
                ? "gradient-brand text-primary-foreground shadow-glow"
                : "glass text-muted-foreground hover:text-primary"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActive(cat.id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                active === cat.id
                  ? "gradient-brand text-primary-foreground shadow-glow"
                  : "glass text-muted-foreground hover:text-primary"
              }`}
            >
              <CategoryIcon name={cat.icon} className="size-4" />
              {cat.name}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              icon={categories.find((c) => c.id === product.category_id)?.icon}
              stock={stock[product.id] ?? 0}
            />
          ))}
        </div>
        {visible.length === 0 ? (
          <p className="glass mt-8 rounded-3xl p-10 text-center text-sm text-muted-foreground">
            Nothing here yet — check back soon.
          </p>
        ) : null}
      </div>
    </SiteLayout>
  );
}
