import { getSession } from "@/app/actions/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import OrderStatusBadge from "@/components/OrderStatusBadge";

export default async function UserOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            include: { category: true },
          },
        },
      },
    },
  });

  if (!order || (order.userId !== session.userId && session.role !== "ADMIN")) {
    redirect("/ordini");
  }

  const steps = [
    { key: "NUOVO", label: "Nuovo" },
    { key: "EVASO", label: "Evaso" },
  ];
  const currentStepIndex = Math.max(
    0,
    steps.findIndex((s) => s.key === (order.status || "NUOVO").toUpperCase())
  );
  const totalQuantity = order.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginBottom: "0.25rem" }}>
            <h2 style={{ margin: 0 }}>Ordine #{order.id.slice(-6).toUpperCase()}</h2>
            <OrderStatusBadge status={order.status} />
          </div>
          <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Effettuato il {order.createdAt.toLocaleString("it-IT")}
          </span>
        </div>
        <Link href="/ordini" className="btn btn-secondary">
          ← Torna ai Miei Ordini
        </Link>
      </div>

      {/* Avanzamento Stato Ordine */}
      <div className="glass-panel">
        <h3 style={{ marginBottom: "1.25rem", fontSize: "1.05rem" }}>Stato di Avanzamento</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
          {steps.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            return (
              <div
                key={step.key}
                style={{
                  padding: "1rem",
                  borderRadius: "10px",
                  border: isCurrent
                    ? "2px solid var(--accent-primary)"
                    : isCompleted
                    ? "1px solid rgba(255, 255, 0, 0.4)"
                    : "1px solid var(--border-color)",
                  backgroundColor: isCompleted
                    ? "rgba(255, 255, 0, 0.1)"
                    : "rgba(255, 255, 255, 0.02)",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: isCompleted ? "var(--accent-primary)" : "var(--text-secondary)",
                    fontWeight: 700,
                    marginBottom: "0.25rem",
                  }}
                >
                  FASE {index + 1}
                </div>
                <div
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: isCompleted ? "var(--text-primary)" : "var(--text-secondary)",
                  }}
                >
                  {step.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Indirizzo di Spedizione e Note */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
        <div className="glass-panel">
          <h3>Indirizzo di Spedizione</h3>
          <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, color: "var(--text-primary)" }}>
            {order.shippingAddress}
          </p>
        </div>

        <div className="glass-panel">
          <h3>Note per la Consegna</h3>
          {order.notes ? (
            <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, color: "var(--text-primary)" }}>
              {order.notes}
            </p>
          ) : (
            <p style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>
              Nessuna nota aggiuntiva specificata per questo ordine.
            </p>
          )}
        </div>
      </div>

      {/* Elenco Materiali Ordinati */}
      <div className="glass-panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ margin: 0 }}>Materiali Ordinati</h3>
          <span style={{ color: "var(--text-secondary)" }}>
            Totale Pezzi: <strong style={{ color: "var(--accent-primary)" }}>{totalQuantity}</strong>
          </span>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-color)", textAlign: "left" }}>
              <th style={{ padding: "0.75rem 0.5rem" }}>Prodotto</th>
              <th style={{ padding: "0.75rem 0.5rem" }}>Codice SKU</th>
              <th style={{ padding: "0.75rem 0.5rem" }}>Categoria</th>
              <th style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}>Quantità</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <td style={{ padding: "0.75rem 0.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  {item.product.imageUrl && (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      style={{
                        width: "44px",
                        height: "44px",
                        objectFit: "contain",
                        borderRadius: "6px",
                        background: "rgba(255,255,255,0.04)",
                      }}
                    />
                  )}
                  <strong>{item.product.name}</strong>
                </td>
                <td style={{ padding: "0.75rem 0.5rem", color: "var(--text-secondary)" }}>
                  {item.product.uniqueCode}
                </td>
                <td style={{ padding: "0.75rem 0.5rem", color: "var(--text-secondary)" }}>
                  {item.product.category.name}
                </td>
                <td
                  style={{
                    padding: "0.75rem 0.5rem",
                    textAlign: "right",
                    fontWeight: 700,
                    fontSize: "1.05rem",
                    color: "var(--accent-primary)",
                  }}
                >
                  x{item.quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
