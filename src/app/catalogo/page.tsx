import { getSession, logout } from "@/app/actions/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function CatalogPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const awaitedSearchParams = await searchParams;
  const currentCategoryId = awaitedSearchParams.category;

  const categories = await prisma.category.findMany();
  
  const products = await prisma.product.findMany({
    where: currentCategoryId ? { categoryId: currentCategoryId } : undefined,
    include: { category: true }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Catalogo Prodotti</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Ordina i materiali disponibili in magazzino.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {session.role === "ADMIN" && (
            <a href="/admin" className="btn btn-primary" style={{ background: 'transparent', border: '1px solid var(--accent-primary)' }}>Torna ad Admin</a>
          )}
          <form action={logout}>
            <button type="submit" className="btn btn-danger">Esci</button>
          </form>
        </div>
      </div>

      {/* Filtri Categoria */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <a 
          href="/catalogo" 
          className="btn" 
          style={{ background: !currentCategoryId ? 'var(--accent-primary)' : 'var(--glass-bg)', color: 'white' }}
        >
          Tutti
        </a>
        {categories.map(c => (
          <a 
            key={c.id}
            href={`/catalogo?category=${c.id}`} 
            className="btn" 
            style={{ background: currentCategoryId === c.id ? 'var(--accent-primary)' : 'var(--glass-bg)', color: 'white' }}
          >
            {c.name}
          </a>
        ))}
      </div>

      {/* Griglia Prodotti */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {products.length === 0 && <p>Nessun prodotto trovato.</p>}
        {products.map(p => (
          <div key={p.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.uniqueCode} • {p.category.name}</span>
              <h3 style={{ marginBottom: '0.5rem', marginTop: '0.2rem' }}>{p.name}</h3>
              {p.description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{p.description}</p>}
            </div>
            
            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', color: p.quantity > 0 ? 'var(--success)' : 'var(--danger)' }}>
                {p.quantity > 0 ? `Disponibili: ${p.quantity}` : 'Esaurito'}
              </span>
              
              {p.quantity > 0 && (
                <form action={async (formData: FormData) => {
                  "use server";
                  await import('@/app/actions/catalog').then(m => m.addToCart(formData));
                }} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="hidden" name="productId" value={p.id} />
                  <input type="number" name="quantity" defaultValue={1} min={1} max={p.quantity} className="input-field" style={{ width: '70px', padding: '0.25rem' }} />
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Aggiungi</button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
