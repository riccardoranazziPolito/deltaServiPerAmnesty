import { getSession } from "@/app/actions/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import OrderStatusBadge from "@/components/OrderStatusBadge";

export default async function UserOrdersPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    include: {
      items: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ marginBottom: "0.25rem" }}>I Miei Ordini</h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Consulta lo storico e lo stato di avanzamento dei tuoi ordini.
          </p>
        </div>
        <Link href="/catalogo" className="btn btn-secondary">
          ← Torna al Catalogo
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.15rem", marginBottom: "1.5rem" }}>
            Non hai ancora effettuato nessun ordine.
          </p>
          <Link href="/catalogo" className="btn btn-primary">
            Sfoglia il Catalogo
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {orders.map((order) => {
            const totalQuantity = order.items.reduce((acc, item) => acc + item.quantity, 0);
            return (
              <div
                key={order.id}
                className="glass-panel"
                style={{
                  padding: "1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid var(--border-color)",
                    paddingBottom: "0.85rem",
                    flexWrap: "wrap",
                    gap: "0.75rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                    <h3 style={{ margin: 0, fontSize: "1.15rem" }}>
                      Ordine #{order.id.slice(-6).toUpperCase()}
                    </h3>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                    {order.createdAt.toLocaleString("it-IT")}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "1rem",
                  }}
                >
                  <div style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                    <span>
                      Articoli diversi: <strong style={{ color: "var(--text-primary)" }}>{order.items.length}</strong>
                    </span>
                    {" • "}
                    <span>
                      Totale pezzi: <strong style={{ color: "var(--accent-primary)" }}>{totalQuantity}</strong>
                    </span>
                  </div>

                  <Link href={`/ordini/${order.id}`} className="btn btn-primary" style={{ padding: "0.5rem 1.15rem" }}>
                    Dettagli Ordine →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
