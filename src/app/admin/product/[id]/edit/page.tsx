import { getSession } from "@/app/actions/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { updateProduct } from "@/app/actions/admin";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  const categories = await prisma.category.findMany();

  if (!product) {
    redirect("/admin");
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Modifica Prodotto</h2>
        <a href="/admin" className="btn btn-secondary">Torna ad Admin</a>
      </div>

      <div className="glass-panel">
        <form 
          action={async (formData) => { 
            "use server"; 
            const res = await updateProduct(formData); 
            if (res.error) {
              // Non potendo mostrare un alert diretto da server action in questo modo semplice, torniamo all'admin in caso di successo
            } else {
              redirect("/admin");
            }
          }} 
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}
        >
          <input type="hidden" name="id" value={product.id} />
          
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Codice Univoco (SKU)</label>
            <input type="text" name="uniqueCode" defaultValue={product.uniqueCode} className="input-field" style={{ width: '100%' }} required />
          </div>
          
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Nome Prodotto</label>
            <input type="text" name="name" defaultValue={product.name} className="input-field" style={{ width: '100%' }} required />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Categoria</label>
            <select name="categoryId" defaultValue={product.categoryId} className="input-field" style={{ width: '100%' }} required>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Giacenza Attuale</label>
            <input type="number" name="quantity" defaultValue={product.quantity} className="input-field" style={{ width: '100%' }} required />
          </div>
          
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Descrizione</label>
            <textarea name="description" defaultValue={product.description || ""} className="input-field" style={{ width: '100%', minHeight: '100px' }} />
          </div>
          
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              Immagine Prodotto (Carica un file per sostituire l'attuale)
            </label>
            {product.imageUrl && (
              <div style={{ marginBottom: '1rem' }}>
                <img src={product.imageUrl} alt="Attuale" style={{ height: '150px', borderRadius: '8px', objectFit: 'cover' }} />
              </div>
            )}
            <input type="file" name="image" accept="image/*" className="input-field" style={{ width: '100%' }} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ gridColumn: 'span 2', marginTop: '1rem' }}>Salva Modifiche</button>
        </form>
      </div>
    </div>
  );
}
