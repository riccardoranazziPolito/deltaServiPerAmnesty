import { getSession } from "@/app/actions/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function MiniCart() {
  const session = await getSession();
  if (!session) return null; // Non mostrare se non loggato

  // Ottieni i prodotti nel carrello per l'utente corrente
  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.userId },
    include: { product: true }
  });

  if (cartItems.length === 0) return null; // Non mostrare se il carrello è vuoto

  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'rgba(20, 20, 20, 0.85)',
      backdropFilter: 'blur(10px)',
      border: '1px solid var(--accent-primary)',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
      color: 'white',
      zIndex: 1000,
      minWidth: '250px',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
        <h4 style={{ margin: 0, color: 'var(--accent-primary)' }}>Carrello ({totalQuantity})</h4>
      </div>
      
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto' }}>
        {cartItems.map(item => (
          <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
              {item.product.name}
            </span>
            <strong style={{ marginLeft: '10px' }}>x{item.quantity}</strong>
          </li>
        ))}
      </ul>

      <Link href="/carrello" className="btn btn-primary" style={{ textAlign: 'center', width: '100%', padding: '0.5rem' }}>
        Vai al Checkout
      </Link>
    </div>
  );
}
