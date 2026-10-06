"use client";

import { useState, useRef } from "react";
import { createProduct } from "@/app/actions/admin";

export default function AddProductForm({ categories }: { categories: any[] }) {
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setMessage("");
    try {
      const res = await createProduct(formData);
      if (res?.error) {
        setIsError(true);
        setMessage("Errore: " + res.error);
      } else {
        setIsError(false);
        setMessage("✅ Prodotto aggiunto con successo!");
        formRef.current?.reset();
      }
    } catch (e) {
      setIsError(true);
      setMessage("Errore imprevisto durante l'aggiunta del prodotto.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form ref={formRef} action={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
      <input type="text" name="uniqueCode" placeholder="Codice Univoco (SKU)" className="input-field" required />
      <input type="text" name="name" placeholder="Nome Prodotto" className="input-field" required />
      <select name="categoryId" className="input-field" required>
        <option value="">Seleziona Categoria...</option>
        {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <input type="number" name="quantity" placeholder="Giacenza Iniziale" className="input-field" required />
      <input type="text" name="description" placeholder="Descrizione (opzionale)" className="input-field" style={{ gridColumn: 'span 2' }} />
      
      <div style={{ gridColumn: 'span 2' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Immagine Prodotto (opzionale)</label>
        <input type="file" name="image" accept="image/*" className="input-field" style={{ width: '100%' }} />
      </div>

      <button type="submit" className="btn btn-primary" style={{ gridColumn: 'span 2' }} disabled={isSubmitting}>
        {isSubmitting ? "Aggiunta in corso..." : "Aggiungi Prodotto"}
      </button>

      {message && (
        <div style={{ gridColumn: 'span 2', padding: '0.75rem', borderRadius: '4px', backgroundColor: isError ? 'rgba(220, 53, 69, 0.2)' : 'rgba(40, 167, 69, 0.2)', color: isError ? 'var(--danger)' : 'var(--success)', border: `1px solid ${isError ? 'var(--danger)' : 'var(--success)'}` }}>
          {message}
        </div>
      )}
    </form>
  );
}
