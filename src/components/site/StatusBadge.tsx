const STYLES: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Pending verification",
    className: "bg-warning/25 text-warning-foreground border-warning/40",
  },
  paid: {
    label: "Payment confirmed",
    className: "bg-primary/15 text-primary border-primary/30",
  },
  delivered: {
    label: "Delivered",
    className: "bg-success/15 text-success border-success/30",
  },
  rejected: {
    label: "Rejected",
    className: "bg-destructive/15 text-destructive border-destructive/30",
  },
};

export function StatusBadge({ status }: { status: string }) {
  const style = STYLES[status] ?? {
    label: status,
    className: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${style.className}`}
    >
      {style.label}
    </span>
  );
}
