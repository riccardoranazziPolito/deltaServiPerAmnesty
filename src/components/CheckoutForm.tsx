"use client";

import { useState } from "react";
import Link from "next/link";
import { checkout } from "@/app/actions/catalog";
import AddressForm from "@/components/AddressForm";

type Recipient = {
  id: string;
  firstName: string;
  lastName: string;
  company: string | null;
  address: string;
  civic: string;
  zipCode: string;
  city: string;
  province: string;
};

export default function CheckoutForm({
  recipients,
  isEmpty,
  children,
}: {
  recipients: Recipient[];
  isEmpty: boolean;
  children: React.ReactNode;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await checkout(formData);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setOrderConfirmed(true);
      }
    } catch {
      setError("Si è verificato un errore imprevisto durante il checkout.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderConfirmed) {
    return (
      <div
        className="glass-panel animate-fade-in"
        style={{
          textAlign: "center",
          padding: "4rem 2rem",
          border: "1px solid var(--success)",
        }}
      >
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
        <h3 style={{ color: "var(--success)", fontSize: "1.5rem", marginBottom: "0.75rem" }}>
          Ordine Confermato con Successo!
        </h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", marginBottom: "2rem" }}>
          Il tuo ordine è stato registrato e riceverai a breve un&apos;email di riepilogo.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/ordini" className="btn btn-primary">
            Visualizza I Miei Ordini
          </Link>
          <Link href="/catalogo" className="btn btn-secondary">
            Torna al Catalogo
          </Link>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="glass-panel" style={{ textAlign: "center", padding: "4rem 2rem" }}>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.2rem", marginBottom: "2rem" }}>
          Il tuo carrello è vuoto
        </p>
        <Link href="/catalogo" className="btn btn-primary">
          Torna al Catalogo
        </Link>
      </div>
    );
  }

  return (
    <>
      {children}

      <div className="glass-panel">
        <h3>Completa l&apos;Ordine</h3>
        <form
          action={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}
        >
          <AddressForm recipients={recipients} />

          {error && (
            <div
              role="alert"
              style={{
                padding: "0.85rem 1rem",
                borderRadius: "8px",
                backgroundColor: "rgba(239, 68, 68, 0.15)",
                border: "1px solid var(--danger)",
                color: "#fca5a5",
                fontSize: "0.95rem",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
            style={{ padding: "1rem", marginTop: "1rem" }}
          >
            {isSubmitting ? "Conferma ordine in corso..." : "Conferma Ordine"}
          </button>
        </form>
      </div>
    </>
  );
}
