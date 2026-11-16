import { getSession } from "@/app/actions/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { UpdateOrderStatusForm } from "@/components/AdminForms";

export default async function AdminOrdersManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; sort?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  const awaitedParams = await searchParams;
  const statusFilter = (awaitedParams.status || "ALL").toUpperCase();
  const sortOrder = awaitedParams.sort === "asc" ? "asc" : "desc";

  const validStatuses = ["NUOVO", "EVASO"];
  const whereOrder = validStatuses.includes(statusFilter)
    ? { status: statusFilter }
    : {};

  const orders = await prisma.order.findMany({
    where: whereOrder,
    include: {
      user: true,
      items: { include: { product: true } },
    },
    orderBy: { createdAt: sortOrder },
  });

  const buildFilterHref = (newStatus: string, newSort: string) => {
    const params = new URLSearchParams();
    if (newStatus && newStatus !== "ALL") params.set("status", newStatus);
    if (newSort && newSort !== "desc") params.set("sort", newSort);
    const qs = params.toString();
    return qs ? `/admin/orders?${qs}` : "/admin/orders";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h2 style={{ marginBottom: "0.25rem" }}>Gestione Ordini ({orders.length})</h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Visualizza, filtra e modifica lo stato degli ordini ricevuti.
          </p>
        </div>
        <Link href="/admin" className="btn btn-secondary">
          ← Torna al Pannello Admin
        </Link>
      </div>

      {/* Barra Filtri Stato e Ordinamento Data */}
      <div
        className="glass-panel"
        style={{
          padding: "1.25rem 1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginRight: "0.25rem" }}>
            Filtra per stato:
          </span>
          {[
            { key: "ALL", label: "Tutti" },
            { key: "NUOVO", label: "Nuovo" },
            { key: "EVASO", label: "Evaso" },
          ].map((s) => {
            const isActive = statusFilter === s.key;
            return (
              <Link
                key={s.key}
                href={buildFilterHref(s.key, sortOrder)}
                className={`btn ${isActive ? "btn-primary" : "btn-secondary"}`}
                style={{ padding: "0.4rem 0.9rem", fontSize: "0.85rem" }}
              >
                {s.label}
              </Link>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginRight: "0.25rem" }}>
            Ordina per data:
          </span>
          <Link
            href={buildFilterHref(statusFilter, "desc")}
            className={`btn ${sortOrder === "desc" ? "btn-primary" : "btn-secondary"}`}
            style={{ padding: "0.4rem 0.9rem", fontSize: "0.85rem" }}
          >
            Più recenti ↓
          </Link>
          <Link
            href={buildFilterHref(statusFilter, "asc")}
            className={`btn ${sortOrder === "asc" ? "btn-primary" : "btn-secondary"}`}
            style={{ padding: "0.4rem 0.9rem", fontSize: "0.85rem" }}
          >
            Meno recenti ↑
          </Link>
        </div>
      </div>

      {/* Lista Ordini */}
      {orders.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: "center", padding: "3rem 2rem" }}>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
            Nessun ordine trovato per i filtri selezionati.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {orders.map((order: any) => (
            <div key={order.id} className="glass-panel" style={{ padding: "1.5rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid var(--border-color)",
                  paddingBottom: "1rem",
                  marginBottom: "1rem",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", flexWrap: "wrap" }}>
                  <strong style={{ fontSize: "1.15rem" }}>
                    Ordine #{order.id.slice(-6).toUpperCase()}
                  </strong>
                  <OrderStatusBadge status={order.status} />
                  <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    {order.createdAt.toLocaleString("it-IT")}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                  <UpdateOrderStatusForm
                    orderId={order.id}
                    currentStatus={order.status || "NUOVO"}
                    compact={true}
                  />
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="btn btn-secondary"
                    style={{ padding: "0.4rem 0.85rem", fontSize: "0.85rem" }}
                  >
                    Dettagli Ordine →
                  </Link>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: "1.25rem",
                }}
              >
                <div>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>
                    Cliente:
                  </p>
                  <p>
                    <strong>
                      {order.user.firstName} {order.user.lastName}
                    </strong>{" "}
                    ({order.user.username} • {order.user.email})
                  </p>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--text-secondary)",
                      marginTop: "0.6rem",
                      marginBottom: "0.2rem",
                    }}
                  >
                    Spedizione:
                  </p>
                  <p style={{ whiteSpace: "pre-wrap", fontSize: "0.9rem" }}>{order.shippingAddress}</p>
                  {order.notes && (
                    <div style={{ marginTop: "0.6rem" }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--accent-primary)", fontWeight: 600 }}>
                        Note di consegna:
                      </span>
                      <p style={{ whiteSpace: "pre-wrap", fontSize: "0.85rem", color: "var(--text-primary)" }}>
                        {order.notes}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.3rem" }}>
                    Materiali Ordinati:
                  </p>
                  <ul style={{ listStyle: "none", fontSize: "0.9rem" }}>
                    {order.items.map((item: any) => (
                      <li
                        key={item.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "0.3rem 0",
                          borderBottom: "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <span>
                          {item.product.name} (SKU: {item.product.uniqueCode})
                        </span>
                        <strong style={{ color: "var(--accent-primary)" }}>x{item.quantity}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
