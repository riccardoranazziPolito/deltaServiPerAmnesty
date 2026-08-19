import { getSession } from "@/app/actions/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { checkout, removeFromCart } from "@/app/actions/catalog";

export default async function CartPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.userId },
    include: { product: true }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Il Tuo Carrello</h2>

      {cartItems.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Il tuo carrello è vuoto.</p>
          <a href="/catalogo" className="btn btn-primary">Torna al Catalogo</a>
        </div>
      ) : (
        <>
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {cartItems.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <h4 style={{ margin: 0 }}>{item.product.name}</h4>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>SKU: {item.product.uniqueCode}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span>Quantità: <strong>{item.quantity}</strong></span>
                  <form action={async () => {
                    "use server";
                    await removeFromCart(item.id);
                  }}>
                    <button type="submit" className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>Rimuovi</button>
                  </form>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-panel">
            <h3>Completa l'Ordine</h3>
            <form action={checkout} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Indirizzo (Via/Piazza)</label>
                  <input type="text" name="address" className="input-field" required placeholder="Es. Via Roma" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Civico</label>
                  <input type="text" name="civic" className="input-field" required placeholder="Es. 10/A" />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>CAP</label>
                  <input type="text" name="zipCode" className="input-field" required placeholder="Es. 00100" maxLength={5} pattern="[0-9]{5}" title="Il CAP deve essere di 5 cifre" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Città</label>
                  <input type="text" name="city" className="input-field" required placeholder="Es. Roma" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Provincia</label>
                  <select name="province" className="input-field" required>
                    <option value="">Seleziona...</option>
                    {['AG','AL','AN','AO','AQ','AR','AP','AT','AV','BA','BT','BL','BN','BG','BI','BO','BZ','BS','BR','CA','CL','CB','CI','CE','CT','CZ','CH','CO','CS','CR','KR','CN','EN','FM','FE','FI','FG','FC','FR','GE','GO','GR','IM','IS','SP','LT','LE','LC','LI','LO','LU','MC','MN','MS','MT','VS','ME','MI','MO','MB','NA','NO','NU','OG','OT','OR','PD','PA','PR','PV','PG','PU','PE','PC','PI','PT','PN','PZ','PO','RG','RA','RC','RE','RI','RN','RM','RO','SA','SS','SV','SI','SR','SO','TA','TE','TR','TO','TP','TN','TV','TS','UD','VA','VE','VB','VC','VR','VV','VI','VT'].map(prov => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </select>
                </div>
              </div>

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
