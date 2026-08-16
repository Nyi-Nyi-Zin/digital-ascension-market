import { Link, useNavigate } from "@tanstack/react-router";
import { CreditCard, PenTool, Play, Sparkles, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice, type Product } from "@/lib/marketplace";
import { useI18n } from "@/lib/i18n";

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
  const isMock = product.is_mock === true;
  const inStock = !isMock && stock > 0;
  const navigate = useNavigate();
  const { t } = useI18n();

  function openDetail() {
    navigate({ to: "/products/$id", params: { id: product.id } });
  }

  return (
    <article
      className="glass lift flex cursor-pointer flex-col rounded-3xl p-3 sm:p-6"
      onClick={openDetail}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openDetail();
        }
      }}
      role="link"
      tabIndex={0}
    >
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
            isMock
              ? "border-primary/30 bg-primary/10 text-primary"
              : inStock
                ? "border-success/30 bg-success/15 text-success"
                : "border-border bg-muted text-muted-foreground"
          }`}
        >
          {isMock ? t("demoPreview") : inStock ? `${stock} in stock` : "Sold out"}
        </span>
      </div>

      <h3 className="mt-4 text-sm font-semibold sm:mt-5 sm:text-base">{product.name}</h3>
      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>

      <div className="mt-4 flex items-center justify-between gap-2 sm:mt-6 sm:gap-3">
        <span className="text-base font-bold sm:text-xl">{formatPrice(product.price)}</span>
        {isMock ? (
          <Button variant="secondary" size="sm" disabled>
            {t("previewOnly")}
          </Button>
        ) : (
          <Button asChild variant={inStock ? "hero" : "secondary"} size="sm" disabled={!inStock}>
            <Link to="/products/$id" params={{ id: product.id }}>
              {inStock ? "Buy Now" : "View"}
            </Link>
          </Button>
        )}
      </div>
    </article>
  );
}
