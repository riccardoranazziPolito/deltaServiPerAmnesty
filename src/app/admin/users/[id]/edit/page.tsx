import { getSession } from "@/app/actions/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { EditUserForm } from "@/components/AdminForms";
import OrderStatusBadge from "@/components/OrderStatusBadge";

export default async function EditUserAccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        include: { items: true },
      },
      recipients: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    redirect("/admin");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: "850px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ marginBottom: "0.25rem" }}>
            Account Manager: {user.firstName} {user.lastName}
          </h2>
          <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Username: {user.username} • Registrato il {user.createdAt.toLocaleDateString("it-IT")}
          </span>
        </div>
        <Link href="/admin" className="btn btn-secondary">
          ← Torna ad Admin
        </Link>
      </div>

      {/* Form Modifica Account */}
      <div className="glass-panel">
        <h3>Modifica Informazioni Account</h3>
        <EditUserForm
          user={{
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            username: user.username,
            role: user.role,
          }}
        />
      </div>

      {/* Storico Ordini dell'Utente */}
      <div className="glass-panel">
        <h3>Ordini Effettuati dall&apos;Utente ({user.orders.length})</h3>
        {user.orders.length === 0 ? (
          <p style={{ color: "var(--text-secondary)" }}>Nessun ordine effettuato da questo account.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
            {user.orders.map((order) => (
              <div
                key={order.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1rem",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  background: "rgba(0,0,0,0.25)",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <strong>Ordine #{order.id.slice(-6).toUpperCase()}</strong>
                  <OrderStatusBadge status={order.status} />
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                    {order.createdAt.toLocaleString("it-IT")}
                  </span>
                </div>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="btn btn-secondary"
                  style={{ padding: "0.4rem 0.85rem", fontSize: "0.85rem" }}
                >
                  Gestisci Ordine →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
