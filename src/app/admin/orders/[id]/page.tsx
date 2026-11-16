import { getSession } from "@/app/actions/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { UpdateOrderStatusForm } from "@/components/AdminForms";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      items: {
        include: {
          product: {
            include: { category: true },
          },
        },
      },
    },
  });

  if (!order) {
    redirect("/admin");
  }

  const totalItems = order.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ marginBottom: "0.25rem" }}>
            Gestione Ordine #{order.id.slice(-6).toUpperCase()}
          </h2>
          <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Effettuato il {order.createdAt.toLocaleString("it-IT")}
          </span>
        </div>
        <Link href="/admin#ordini" className="btn btn-secondary">
          ← Torna agli Ordini Admin
        </Link>
      </div>

      {/* Gestione Stato Ordine */}
      <div className="glass-panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem" }}>
        <div>
          <span style={{ display: "block", color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
            Stato Attuale dell&apos;Ordine
          </span>
          <OrderStatusBadge status={order.status} />
        </div>
        <div>
          <label style={{ display: "block", color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
            Modifica Stato Ordine
          </label>
          <UpdateOrderStatusForm orderId={order.id} currentStatus={order.status || "NUOVO"} />
        </div>
      </div>

      {/* Dettagli Cliente e Spedizione */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
        <div className="glass-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ margin: 0 }}>Dati Cliente</h3>
            <Link
              href={`/admin/users/${order.user.id}/edit`}
              className="btn btn-secondary"
              style={{ padding: "0.3rem 0.65rem", fontSize: "0.8rem" }}
            >
              Gestisci Account
            </Link>
          </div>
          <p style={{ marginBottom: "0.5rem" }}>
            <strong>Nome:</strong> {order.user.firstName} {order.user.lastName}
          </p>
          <p style={{ marginBottom: "0.5rem" }}>
            <strong>Username:</strong> {order.user.username}
          </p>
          <p>
            <strong>Email:</strong> {order.user.email}
          </p>
        </div>

        <div className="glass-panel">
          <h3>Indirizzo di Spedizione</h3>
          <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{order.shippingAddress}</p>
          {order.notes && (
            <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}>
              <span style={{ display: "block", color: "var(--accent-primary)", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                Note per la consegna:
              </span>
              <p style={{ whiteSpace: "pre-wrap", color: "var(--text-primary)", fontSize: "0.95rem" }}>
                {order.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Materiali Ordinati */}
      <div className="glass-panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ margin: 0 }}>Materiali Ordinati</h3>
          <span style={{ color: "var(--text-secondary)" }}>
            Totale Pezzi: <strong style={{ color: "var(--accent-primary)" }}>{totalItems}</strong>
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
                      style={{ width: "44px", height: "44px", objectFit: "contain", borderRadius: "6px", background: "rgba(255,255,255,0.04)" }}
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
                <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontWeight: 700, fontSize: "1.05rem", color: "var(--accent-primary)" }}>
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
