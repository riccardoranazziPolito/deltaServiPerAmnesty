import { getSession, logout } from "@/app/actions/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import AddProductForm from "@/components/AddProductForm";
import {
  CreateCategoryForm,
  CreateUserForm,
  UpdateStockForm,
  ProductActionButtons,
} from "@/components/AdminForms";

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  const categories = await prisma.category.findMany();
  const products = await prisma.product.findMany({ include: { category: true } });
  const users = await prisma.user.findMany({ where: { role: "USER" } });
  const orders = await prisma.order.findMany({
    include: {
      user: true,
      items: { include: { product: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Pannello Amministratore</h2>
        <form action={logout}>
          <button type="submit" className="btn btn-danger">Esci</button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Gestione Categorie */}
        <div className="glass-panel">
          <h3>Nuova Categoria</h3>
          <CreateCategoryForm />
          <ul style={{ marginTop: '1rem', listStyle: 'none' }}>
            {categories.map((c: any) => (
              <li key={c.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>{c.name}</li>
            ))}
          </ul>
        </div>

        {/* Gestione Utenti */}
        <div className="glass-panel">
          <h3>Nuovo Utente (Cliente)</h3>
          <CreateUserForm />
          <ul style={{ marginTop: '1rem', listStyle: 'none' }}>
            {users.map((u: any) => (
              <li key={u.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <strong>{u.firstName} {u.lastName}</strong> <br/>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  User: {u.username} | {u.email}
                </span>
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
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
              <th style={{ padding: '0.5rem' }}>Codice</th>
              <th style={{ padding: '0.5rem' }}>Prodotto</th>
              <th style={{ padding: '0.5rem' }}>Categoria</th>
              <th style={{ padding: '0.5rem' }}>Disponibili</th>
              <th style={{ padding: '0.5rem' }}>Aggiorna</th>
              <th style={{ padding: '0.5rem' }}>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p: any) => (
              <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '0.5rem' }}>{p.uniqueCode}</td>
                <td style={{ padding: '0.5rem' }}>{p.name}</td>
                <td style={{ padding: '0.5rem' }}>{p.category.name}</td>
                <td style={{ padding: '0.5rem' }}>
                  <span style={{ fontWeight: 'bold', color: p.quantity > 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {p.quantity}
                  </span>
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <UpdateStockForm productId={p.id} initialQuantity={p.quantity} />
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <ProductActionButtons productId={p.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Gestione Ordini */}
      <div className="glass-panel">
        <h3>Ordini Ricevuti</h3>
        {orders.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Nessun ordine ricevuto finora.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {orders.map((order: any) => (
              <div key={order.id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                  <strong>Ordine #{order.id.slice(-6).toUpperCase()}</strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {order.createdAt.toLocaleString('it-IT')}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Cliente:</p>
                    <p>{order.user.username}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: '0.2rem' }}>Spedizione:</p>
                    <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>{order.shippingAddress}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Materiali Ordinati:</p>
                    <ul style={{ listStyle: 'none', fontSize: '0.9rem' }}>
                      {order.items.map((item: any) => (
                        <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0' }}>
                          <span>{item.product.name} (SKU: {item.product.uniqueCode})</span>
                          <strong>x{item.quantity}</strong>
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
