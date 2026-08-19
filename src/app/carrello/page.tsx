import { getSession } from "@/app/actions/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { checkout } from "@/app/actions/catalog";

import AddressForm from "@/components/AddressForm";

export default async function CartPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.userId },
    include: { product: true }
  });

  const recipients = await prisma.recipient.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' }
  });

  const total = cartItems.reduce((acc: number, item: any) => acc + item.quantity, 0);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Il tuo Carrello</h2>
      </div>

      {cartItems.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '2rem' }}>Il tuo carrello è vuoto</p>
          <a href="/catalogo" className="btn btn-primary">Torna al Catalogo</a>
        </div>
      ) : (
        <>
          <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {cartItems.map((item: any) => (
                <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0' }}>{item.product.name}</h4>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Codice: {item.product.uniqueCode}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                      x{item.quantity}
                    </div>
                    <form action={async () => {
                      "use server";
                      await import('@/app/actions/catalog').then(m => m.removeFromCart(item.id));
                    }}>
                      <button type="submit" className="btn" style={{ background: 'transparent', color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)', padding: '0.5rem 1rem' }}>
                        Rimuovi
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Totale Pezzi</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{total}</span>
            </div>
          </div>

          <div className="glass-panel">
            <h3>Completa l'Ordine</h3>
            <form action={async (formData: FormData) => {
              "use server";
              await checkout(formData);
            }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              
              <AddressForm recipients={recipients} />

              <button type="submit" className="btn btn-primary" style={{ padding: '1rem', marginTop: '1rem' }}>
                Conferma Ordine
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
