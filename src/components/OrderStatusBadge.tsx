export type OrderStatus = "NUOVO" | "EVASO" | "CONSEGNATO";

export function formatOrderStatus(status?: string | null): string {
  const normalized = (status || "NUOVO").toUpperCase();
  switch (normalized) {
    case "EVASO":
      return "Evaso";
    case "CONSEGNATO":
      return "Consegnato";
    case "NUOVO":
    default:
      return "Nuovo";
  }
}

export default function OrderStatusBadge({ status }: { status?: string | null }) {
  const normalized = (status || "NUOVO").toUpperCase();

  let bg = "rgba(255, 255, 0, 0.15)";
  let color = "var(--accent-primary)";
  let border = "1px solid var(--accent-primary)";
  let label = "Nuovo";

  if (normalized === "EVASO") {
    bg = "rgba(59, 130, 246, 0.18)";
    color = "#60a5fa";
    border = "1px solid #60a5fa";
    label = "Evaso";
  } else if (normalized === "CONSEGNATO") {
    bg = "rgba(16, 185, 129, 0.18)";
    color = "var(--success)";
    border = "1px solid var(--success)";
    label = "Consegnato";
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "0.25rem 0.75rem",
        borderRadius: "9999px",
        fontSize: "0.8rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        backgroundColor: bg,
        color,
        border,
      }}
    >
      {label}
    </span>
  );
}
