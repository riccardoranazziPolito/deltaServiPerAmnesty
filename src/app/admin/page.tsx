import { getSession, logout } from "@/app/actions/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import AddProductForm from "@/components/AddProductForm";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import {
  CreateCategoryForm,
  CreateUserForm,
  UpdateStockForm,
  ProductActionButtons,
  UpdateOrderStatusForm,
} from "@/components/AdminForms";

export default async function AdminDashboard({
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

  const categories = await prisma.category.findMany();
  const products = await prisma.product.findMany({ include: { category: true } });
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

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

  const buildOrderFilterHref = (newStatus: string, newSort: string) => {
    const params = new URLSearchParams();
    if (newStatus && newStatus !== "ALL") params.set("status", newStatus);
    if (newSort && newSort !== "desc") params.set("sort", newSort);
    const qs = params.toString();
    return qs ? `/admin?${qs}#ordini` : "/admin#ordini";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <h2>Pannello Amministratore</h2>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          <Link href="/admin/orders" className="btn btn-primary">
            Gestione Ordini ({orders.length}) →
          </Link>
          <form action={logout}>
            <button type="submit" className="btn btn-danger">Esci</button>
          </form>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
        {/* Gestione Categorie */}
        <div className="glass-panel">
          <h3>Nuova Categoria</h3>
          <CreateCategoryForm />
          <ul style={{ marginTop: "1rem", listStyle: "none" }}>
            {categories.map((c: any) => (
              <li key={c.id} style={{ padding: "0.5rem 0", borderBottom: "1px solid var(--border-color)" }}>
                {c.name}
              </li>
            ))}
          </ul>
        </div>

        {/* Gestione Utenti / Account Manager */}
        <div className="glass-panel">
          <h3>Account Manager / Nuovo Utente</h3>
          <CreateUserForm />
          <ul style={{ marginTop: "1.25rem", listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {users.map((u: any) => (
              <li
                key={u.id}
                style={{
                  padding: "0.65rem 0",
                  borderBottom: "1px solid var(--border-color)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <div>
                  <strong>
                    {u.firstName} {u.lastName}
                  </strong>{" "}
                  {u.role === "ADMIN" && (
                    <span
                      style={{
                        fontSize: "0.7rem",
                        padding: "0.1rem 0.45rem",
                        borderRadius: "4px",
                        backgroundColor: "var(--accent-primary)",
                        color: "#000",
                        fontWeight: 700,
                        marginLeft: "0.35rem",
                      }}
                    >
                      ADMIN
                    </span>
                  )}
                  <br />
                  <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    User: {u.username} | {u.email}
                  </span>
                </div>
                <Link
                  href={`/admin/users/${u.id}/edit`}
                  className="btn btn-secondary"
                  style={{ padding: "0.35rem 0.7rem", fontSize: "0.8rem", whiteSpace: "nowrap" }}
                >
                  Gestisci
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Gestione Prodotti */}
      <div className="glass-panel">
        <h3>Nuovo Prodotto</h3>
        <AddProductForm categories={categories} />
      </div>

      {/* Tabella Giacenze */}
      <div className="glass-panel">
        <h3>Giacenze Prodotti</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-color)", textAlign: "left" }}>
              <th style={{ padding: "0.5rem" }}>Codice</th>
              <th style={{ padding: "0.5rem" }}>Prodotto</th>
              <th style={{ padding: "0.5rem" }}>Categoria</th>
              <th style={{ padding: "0.5rem" }}>Disponibili</th>
              <th style={{ padding: "0.5rem" }}>Aggiorna</th>
              <th style={{ padding: "0.5rem" }}>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p: any) => (
              <tr key={p.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ padding: "0.5rem" }}>{p.uniqueCode}</td>
                <td style={{ padding: "0.5rem" }}>{p.name}</td>
                <td style={{ padding: "0.5rem" }}>{p.category.name}</td>
                <td style={{ padding: "0.5rem" }}>
                  <span style={{ fontWeight: "bold", color: p.quantity > 0 ? "var(--success)" : "var(--danger)" }}>
                    {p.quantity}
                  </span>
                </td>
                <td style={{ padding: "0.5rem" }}>
                  <UpdateStockForm productId={p.id} initialQuantity={p.quantity} />
                </td>
                <td style={{ padding: "0.5rem" }}>
                  <ProductActionButtons productId={p.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Gestione Ordini */}
      <div id="ordini" className="glass-panel">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "1.25rem",
          }}
        >
          <h3 style={{ margin: 0 }}>Ordini Ricevuti ({orders.length})</h3>

          {/* Controlli Filtro Stato & Ordinamento Data */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginRight: "0.25rem" }}>
                Stato:
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
                    href={buildOrderFilterHref(s.key, sortOrder)}
                    className={`btn ${isActive ? "btn-primary" : "btn-secondary"}`}
                    style={{ padding: "0.35rem 0.75rem", fontSize: "0.85rem" }}
                  >
                    {s.label}
                  </Link>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginRight: "0.25rem" }}>
                Data:
              </span>
              <Link
                href={buildOrderFilterHref(statusFilter, "desc")}
                className={`btn ${sortOrder === "desc" ? "btn-primary" : "btn-secondary"}`}
                style={{ padding: "0.35rem 0.75rem", fontSize: "0.85rem" }}
              >
                Più recenti ↓
              </Link>
              <Link
                href={buildOrderFilterHref(statusFilter, "asc")}
                className={`btn ${sortOrder === "asc" ? "btn-primary" : "btn-secondary"}`}
                style={{ padding: "0.35rem 0.75rem", fontSize: "0.85rem" }}
              >
                Meno recenti ↑
              </Link>
            </div>
          </div>
        </div>

        {orders.length === 0 ? (
          <p style={{ color: "var(--text-secondary)", marginTop: "1rem" }}>
            Nessun ordine trovato per i filtri selezionati.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
            {orders.map((order: any) => (
              <div
                key={order.id}
                style={{
                  padding: "1.25rem",
                  border: "1px solid var(--border-color)",
                  borderRadius: "10px",
                  background: "rgba(0,0,0,0.35)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid var(--border-color)",
                    paddingBottom: "0.75rem",
                    marginBottom: "0.75rem",
                    flexWrap: "wrap",
                    gap: "0.75rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <strong style={{ fontSize: "1.05rem" }}>
                      Ordine #{order.id.slice(-6).toUpperCase()}
                    </strong>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      {order.createdAt.toLocaleString("it-IT")}
                    </span>
                    <UpdateOrderStatusForm
                      orderId={order.id}
                      currentStatus={order.status || "NUOVO"}
                      compact={true}
                    />
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="btn btn-secondary"
                      style={{ padding: "0.35rem 0.85rem", fontSize: "0.85rem" }}
                    >
                      Dettagli →
                    </Link>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
                  <div>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>
                      Cliente:
                    </p>
                    <p>
                      <strong>{order.user.firstName} {order.user.lastName}</strong> ({order.user.username})
                    </p>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.5rem", marginBottom: "0.2rem" }}>
                      Spedizione:
                    </p>
                    <p style={{ whiteSpace: "pre-wrap", fontSize: "0.9rem" }}>{order.shippingAddress}</p>
                    {order.notes && (
                      <div style={{ marginTop: "0.5rem" }}>
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
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>
                      Materiali Ordinati:
                    </p>
                    <ul style={{ listStyle: "none", fontSize: "0.9rem" }}>
                      {order.items.map((item: any) => (
                        <li
                          key={item.id}
                          style={{ display: "flex", justifyContent: "space-between", padding: "0.25rem 0" }}
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
    </div>
  );
}
