"use client";

import { useState, useRef } from "react";
import { addToCart } from "@/app/actions/catalog";

export default function AddToCartForm({ productId, maxQuantity }: { productId: string, maxQuantity: number }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    setStatus("loading");
    setErrorMessage("");
    try {
      const res = await addToCart(formData);
      if (res?.error) {
        setStatus("error");
        setErrorMessage(res.error);
        setTimeout(() => setStatus("idle"), 4000);
      } else {
        setStatus("success");
        setTimeout(() => {
            setStatus("idle");
            if (formRef.current) formRef.current.reset(); // reset quantity to 1
        }, 2000); // revert back after 2 seconds
      }
    } catch (e) {
      setStatus("error");
      setErrorMessage("Errore imprevisto");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  return (
    <form ref={formRef} action={handleSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', position: 'relative' }}>
      <input type="hidden" name="productId" value={productId} />
      <input type="number" name="quantity" defaultValue={1} min={1} max={maxQuantity} className="input-field" style={{ width: '70px', padding: '0.25rem' }} />
      <button 
        type="submit" 
        className={`btn ${status === 'success' ? 'btn-secondary' : status === 'error' ? 'btn-danger' : 'btn-primary'}`} 
        style={{ 
          padding: '0.5rem 1rem', 
          backgroundColor: status === 'success' ? 'var(--success)' : undefined,
          color: status === 'success' ? 'white' : undefined,
          borderColor: status === 'success' ? 'var(--success)' : undefined,
          minWidth: '100px'
        }}
        disabled={status === 'loading' || status === 'success'}
      >
        {status === 'loading' ? "..." : status === 'success' ? "✅ Aggiunto" : status === 'error' ? "❌ Errore" : "Aggiungi"}
      </button>
      
      {status === 'error' && (
        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', color: 'var(--danger)', fontSize: '0.8rem', backgroundColor: 'rgba(220, 53, 69, 0.1)', border: '1px solid var(--danger)', padding: '0.2rem 0.5rem', borderRadius: '4px', zIndex: 10 }}>
          {errorMessage}
        </div>
      )}
    </form>
  );
}
