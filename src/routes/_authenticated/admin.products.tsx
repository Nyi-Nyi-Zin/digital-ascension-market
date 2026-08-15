import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Boxes, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { categoriesQuery, formatPrice, type Product } from "@/lib/marketplace";

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: AdminProducts,
});

const productSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  description: z.string().trim().max(1000),
  category_id: z.string().uuid("Pick a category"),
  price: z.number().min(0).max(100000),
  what_you_get: z.string().trim().max(1000),
});

function AdminProducts() {
  const queryClient = useQueryClient();
  const { data: categories } = useQuery(categoriesQuery);

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });

  const { data: stockRows } = useQuery({
    queryKey: ["admin-stock"],
    queryFn: async () => {
      const { data, error } = await supabase.from("stock_items").select("product_id, status");
      if (error) throw error;
      return data as { product_id: string; status: string }[];
    },
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [stockFor, setStockFor] = useState<Product | null>(null);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["admin-stock"] });
    queryClient.invalidateQueries({ queryKey: ["stock-counts"] });
  };

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Product deleted");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function countFor(productId: string, status: string) {
    return (stockRows ?? []).filter((s) => s.product_id === productId && s.status === status).length;
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Products</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage the catalogue and load credentials into stock.
          </p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (!next) setEditing(null);
          }}
        >
          <DialogTrigger asChild>
            <Button variant="hero">
              <Plus /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit product" : "Add product"}</DialogTitle>
            </DialogHeader>
            <ProductForm
              product={editing}
              categories={categories ?? []}
              onDone={() => {
                setOpen(false);
                setEditing(null);
                refresh();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex min-h-[20vh] items-center justify-center">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="glass mt-6 overflow-x-auto rounded-3xl p-2">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="text-left text-xs tracking-widest text-subtle uppercase">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(products ?? []).map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3 font-semibold">{product.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {categories?.find((c) => c.id === product.category_id)?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-success">
                      {countFor(product.id, "available")}
                    </span>
                    <span className="text-subtle"> avail · {countFor(product.id, "sold")} sold</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button variant="soft" size="sm" onClick={() => setStockFor(product)}>
                        <Boxes /> Stock
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditing(product);
                          setOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete product"
                        onClick={() => remove.mutate(product.id)}
                      >
                        <Trash2 className="text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {(products?.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    No products yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={Boolean(stockFor)} onOpenChange={(open) => (!open ? setStockFor(null) : null)}>
        <DialogContent className="rounded-3xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Stock · {stockFor?.name}</DialogTitle>
          </DialogHeader>
          {stockFor ? (
            <StockForm
              product={stockFor}
              available={countFor(stockFor.id, "available")}
              sold={countFor(stockFor.id, "sold")}
              onDone={() => {
                setStockFor(null);
                refresh();
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductForm({
  product,
  categories,
  onDone,
}: {
  product: Product | null;
  categories: { id: string; name: string }[];
  onDone: () => void;
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? categories[0]?.id ?? "");
  const [price, setPrice] = useState(String(product?.price ?? ""));
  const [whatYouGet, setWhatYouGet] = useState(product?.what_you_get ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const parsed = productSchema.safeParse({
      name,
      description,
      category_id: categoryId,
      price: Number(price),
      what_you_get: whatYouGet,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check the form");
      return;
    }
    setBusy(true);
    try {
      let imageUrl = product?.image_url ?? null;
      if (imageFile) {
        const ext = imageFile.name.split(".").pop()?.toLowerCase() ?? "png";
        const path = `products/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("payment-proofs")
          .upload(path, imageFile, { contentType: imageFile.type });
        if (uploadError) throw uploadError;
        const { data } = await supabase.storage
          .from("payment-proofs")
          .createSignedUrl(path, 60 * 60 * 24 * 365);
        imageUrl = data?.signedUrl ?? null;
      }

      if (product) {
        const { error } = await supabase
          .from("products")
          .update({ ...parsed.data, image_url: imageUrl })
          .eq("id", product.id);
        if (error) throw error;
        toast.success("Product updated");
      } else {
        const { error } = await supabase
          .from("products")
          .insert({ ...parsed.data, image_url: imageUrl });
        if (error) throw error;
        toast.success("Product added");
      }
      onDone();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save product");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="p-name">Name</Label>
        <Input
          id="p-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={120}
          className="rounded-full"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="p-desc">Description</Label>
        <Textarea
          id="p-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={1000}
          className="rounded-2xl"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="p-cat">Category</Label>
          <select
            id="p-cat"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="h-10 w-full rounded-full border border-input bg-background/70 px-4 text-sm"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="p-price">Price (USD)</Label>
          <Input
            id="p-price"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="rounded-full"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="p-wyg">What you get (one per line)</Label>
        <Textarea
          id="p-wyg"
          value={whatYouGet}
          onChange={(e) => setWhatYouGet(e.target.value)}
          rows={5}
          maxLength={1000}
          className="rounded-2xl"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="p-img">Product image (optional)</Label>
        <Input
          id="p-img"
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          className="rounded-full"
        />
      </div>
      <Button type="submit" variant="hero" className="w-full" disabled={busy}>
        {busy ? <Loader2 className="animate-spin" /> : null} Save product
      </Button>
    </form>
  );
}

function StockForm({
  product,
  available,
  sold,
  onDone,
}: {
  product: Product;
  available: number;
  sold: number;
  onDone: () => void;
}) {
  const [bulk, setBulk] = useState("");
  const [busy, setBusy] = useState(false);

  async function addStock() {
    const lines = bulk
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) {
      toast.error("Add at least one credential line");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase
        .from("stock_items")
        .insert(lines.map((line) => ({ product_id: product.id, credential_data: line })));
      if (error) throw error;
      toast.success(`${lines.length} stock item(s) added`);
      setBulk("");
      onDone();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add stock");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3 text-sm">
        <span className="rounded-full border border-success/30 bg-success/15 px-3 py-1 font-semibold text-success">
          {available} available
        </span>
        <span className="rounded-full border border-border bg-muted px-3 py-1 font-semibold text-muted-foreground">
          {sold} sold
        </span>
      </div>
      <div className="space-y-2">
        <Label htmlFor="stock">Bulk add credentials (one per line)</Label>
        <Textarea
          id="stock"
          rows={8}
          value={bulk}
          onChange={(e) => setBulk(e.target.value)}
          placeholder={"email1@x.com | pass123\nemail2@x.com | pass456"}
          className="rounded-2xl font-mono text-xs"
        />
      </div>
      <Button variant="hero" className="w-full" onClick={addStock} disabled={busy}>
        {busy ? <Loader2 className="animate-spin" /> : null} Add to stock
      </Button>
    </div>
  );
}
