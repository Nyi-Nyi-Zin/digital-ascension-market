import { useNavigate } from "@tanstack/react-router";
import {
  CreditCard,
  Flame,
  LockKeyhole,
  Palette,
  PenTool,
  Play,
  PlayCircle,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice, type Product } from "@/lib/marketplace";

const ICONS: Record<string, LucideIcon> = {
  Sparkles,
  sparkles: Sparkles,
  PenTool,
  pen: PenTool,
  palette: Palette,
  CreditCard,
  "credit-card": CreditCard,
  Play,
  play: Play,
  "play-circle": PlayCircle,
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
  categoryName,
  stock,
}: {
  product: Product;
  icon?: string | undefined;
  categoryName?: string | undefined;
  stock: number;
}) {
  const navigate = useNavigate();
  const inStock = stock > 0;

  function openDetail() {
    navigate({ to: "/products/$id", params: { id: product.id } });
  }

  if (!inStock) return null;

  return (
    <article
      className="group flex cursor-pointer flex-col overflow-hidden rounded-[1.55rem] border border-cyan-300/15 bg-[#07131c] shadow-[0_14px_30px_rgba(0,0,0,0.28)] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/40 hover:shadow-[0_18px_42px_rgba(0,220,210,0.16)]"
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
      <div className="relative aspect-[1.28] overflow-hidden bg-[#0b1d2a]">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-[radial-gradient(circle_at_50%_35%,rgba(47,214,207,0.22),transparent_52%),linear-gradient(145deg,#102938,#050b12)]">
            <CategoryIcon name={icon} className="size-20 text-cyan-200/80" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#07131c] via-transparent to-transparent" />
        <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full border border-cyan-300/50 bg-[#082a31]/85 px-3 py-1.5 text-[10px] font-bold tracking-[0.22em] text-cyan-200 uppercase shadow-[0_0_16px_rgba(34,211,238,0.15)]">
          <Flame className="size-3" /> Top
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="truncate text-[10px] font-semibold tracking-[0.24em] text-cyan-200/65 uppercase">
          {categoryName ?? "Digital product"}
        </p>
        <h3 className="mt-2 line-clamp-2 min-h-11 text-sm leading-snug font-bold text-slate-100 sm:text-base">
          {product.name}
        </h3>
        <div className="mt-4 flex items-end justify-between gap-2 border-t border-white/10 pt-3">
          <div>
            <p className="text-lg font-extrabold text-white sm:text-xl">
              {formatPrice(product.price)}
            </p>
            <p className="mt-0.5 text-[10px] tracking-[0.16em] text-slate-400 uppercase">
              {Number(product.price).toFixed(2)} units required
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            className="shrink-0 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 text-[10px] font-bold tracking-[0.16em] text-cyan-200 uppercase hover:bg-cyan-300/20"
            onClick={(event) => {
              event.stopPropagation();
              openDetail();
            }}
          >
            <LockKeyhole className="size-3.5" /> Unlock
          </Button>
        </div>
      </div>
    </article>
  );
}
