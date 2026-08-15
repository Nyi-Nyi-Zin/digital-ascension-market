import { Link } from "@tanstack/react-router";
import {
  CreditCard,
  PenTool,
  Play,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice, type Product } from "@/lib/marketplace";

const ICONS: Record<string, LucideIcon> = {
  Sparkles,
  PenTool,
  CreditCard,
  Play,
};

export function CategoryIcon({
  name,
  className,
}: {
  name?: string | undefined;
  className?: string | undefined;
}) {
  const Icon = ICONS[name ?? "Sparkles"] ?? Sparkles;
  return <Icon className={className} />;
}

export function ProductCard({
  product,
  icon,
  stock,
}: {
  product: Product;
  icon?: string | undefined;
  stock: number;
}) {
  const inStock = stock > 0;

  return (
    <article className="glass lift flex flex-col rounded-3xl p-6">
      <div className="flex items-start justify-between gap-3">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="size-14 rounded-2xl object-cover"
          />
        ) : (
          <span className="gradient-brand flex size-14 items-center justify-center rounded-full shadow-glow">
            <CategoryIcon name={icon} className="size-6 text-primary-foreground" />
          </span>
        )}
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
            inStock
              ? "border-success/30 bg-success/15 text-success"
              : "border-border bg-muted text-muted-foreground"
          }`}
        >
          {inStock ? `${stock} in stock` : "Sold out"}
        </span>
      </div>

      <h3 className="mt-5 text-base font-semibold">{product.name}</h3>
      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>

      <div className="mt-6 flex items-center justify-between gap-3">
        <span className="text-xl font-bold">{formatPrice(product.price)}</span>
        <Button asChild variant={inStock ? "hero" : "secondary"} size="sm" disabled={!inStock}>
          <Link to="/products/$id" params={{ id: product.id }}>
            {inStock ? "Buy Now" : "View"}
          </Link>
        </Button>
      </div>
    </article>
  );
}
