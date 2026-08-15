import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, Check, Package, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { CategoryIcon } from "@/components/site/ProductCard";
import {
  categoriesQuery,
  formatPrice,
  productQuery,
  stockCountsQuery,
  whatYouGetList,
} from "@/lib/marketplace";

export const Route = createFileRoute("/products/$id")({
  loader: async ({ context, params }) => {
    const product = await context.queryClient.ensureQueryData(productQuery(params.id));
    if (!product) throw notFound();
    await Promise.all([
      context.queryClient.ensureQueryData(categoriesQuery),
      context.queryClient.ensureQueryData(stockCountsQuery),
    ]);
    return { name: product.name, description: product.description };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Product unavailable — Cloud Nine" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.name} — Cloud Nine`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.description.slice(0, 155) },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.description.slice(0, 155) },
      ],
    };
  },
  component: ProductDetail,
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This product may have been removed from the store.
        </p>
        <Button asChild variant="hero" className="mt-6">
          <Link to="/products">Back to products</Link>
        </Button>
      </div>
    </SiteLayout>
  ),
});

function ProductDetail() {
  const { id } = Route.useParams();
  const { data: product } = useSuspenseQuery(productQuery(id));
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const { data: stock } = useSuspenseQuery(stockCountsQuery);

  if (!product) return null;
  const available = stock[product.id] ?? 0;
  const category = categories.find((c) => c.id === product.category_id);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="size-4" /> All products
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="glass rounded-3xl p-8">
            <div className="flex items-center gap-4">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="size-16 rounded-2xl object-cover"
                />
              ) : (
                <span className="gradient-brand flex size-16 items-center justify-center rounded-full shadow-glow">
                  <CategoryIcon name={category?.icon} className="size-7 text-primary-foreground" />
                </span>
              )}
              <div>
                {category ? (
                  <span className="text-xs font-bold tracking-widest text-subtle uppercase">
                    {category.name}
                  </span>
                ) : null}
                <h1 className="text-2xl font-bold sm:text-3xl">{product.name}</h1>
              </div>
            </div>

            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            <h2 className="mt-8 text-sm font-bold tracking-widest text-subtle uppercase">
              What you get
            </h2>
            <ul className="mt-4 space-y-3">
              {whatYouGetList(product.what_you_get).map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-success/15">
                    <Check className="size-3 text-success" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <aside className="glass h-fit rounded-3xl p-8 lg:sticky lg:top-24">
            <p className="text-sm text-muted-foreground">Price</p>
            <p className="mt-1 text-4xl font-extrabold">{formatPrice(product.price)}</p>

            <div className="mt-6 flex items-center gap-2 text-sm">
              <Package className="size-4 text-primary" />
              {available > 0 ? (
                <span className="font-semibold text-success">{available} in stock</span>
              ) : (
                <span className="font-semibold text-muted-foreground">Currently sold out</span>
              )}
            </div>

            <Button asChild variant="hero" size="lg" className="mt-6 w-full" disabled={available === 0}>
              {available > 0 ? (
                <Link to="/checkout/$productId" params={{ productId: product.id }}>
                  Buy Now
                </Link>
              ) : (
                <span>Sold out</span>
              )}
            </Button>

            <ul className="mt-6 space-y-3 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" /> Manual payment review by our team
              </li>
              <li className="flex items-center gap-2">
                <Zap className="size-4 text-primary" /> Credentials unlock right after approval
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </SiteLayout>
  );
}
