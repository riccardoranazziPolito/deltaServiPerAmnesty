"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createCategory,
  createUser,
  updateStock,
  deleteProduct,
  updateProduct,
  updateOrderStatus,
  updateUser,
} from "@/app/actions/admin";

function FeedbackBanner({ message, isError }: { message: string; isError: boolean }) {
  if (!message) return null;
  return (
    <div
      role={isError ? "alert" : "status"}
      style={{
        padding: "0.75rem",
        borderRadius: "6px",
        backgroundColor: isError ? "rgba(220, 53, 69, 0.2)" : "rgba(16, 185, 129, 0.2)",
        color: isError ? "#fca5a5" : "var(--success)",
        border: `1px solid ${isError ? "var(--danger)" : "var(--success)"}`,
        fontSize: "0.9rem",
      }}
    >
      {message}
    </div>
  );
}

export function CreateCategoryForm() {
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setMessage("");
    try {
      const res = await createCategory(formData);
      if (res?.error) {
        setIsError(true);
        setMessage(res.error);
      } else {
        setIsError(false);
        setMessage("✅ Categoria aggiunta con successo!");
        formRef.current?.reset();
      }
    } catch {
      setIsError(true);
      setMessage("Errore imprevisto durante la creazione della categoria.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
    >
      <input
        type="text"
        name="name"
        placeholder="Nome Categoria"
        className="input-field"
        required
      />
      <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
        {isSubmitting ? "Aggiunta..." : "Aggiungi"}
      </button>
      <FeedbackBanner message={message} isError={isError} />
    </form>
  );
}

export function CreateUserForm() {
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setMessage("");
    try {
      const res = await createUser(formData);
      if (res?.error) {
        setIsError(true);
        setMessage(res.error);
      } else {
        setIsError(false);
        setMessage("✅ Utente creato con successo!");
        formRef.current?.reset();
      }
    } catch {
      setIsError(true);
      setMessage("Errore imprevisto durante la creazione dell'utente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <input type="text" name="firstName" placeholder="Nome" className="input-field" required />
        <input type="text" name="lastName" placeholder="Cognome" className="input-field" required />
      </div>
      <input type="email" name="email" placeholder="Email" className="input-field" required />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <input type="text" name="username" placeholder="Username" className="input-field" required />
        <input type="text" name="password" placeholder="Password" className="input-field" required />
      </div>
      <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
        {isSubmitting ? "Creazione in corso..." : "Crea Utente"}
      </button>
      <FeedbackBanner message={message} isError={isError} />
    </form>
  );
}

export function UpdateStockForm({
  productId,
  initialQuantity,
}: {
  productId: string;
  initialQuantity: number;
}) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (formData: FormData) => {
    setStatus("saving");
    setErrorMsg("");
    try {
      const q = parseInt(formData.get("q") as string, 10);
      const res = await updateStock(productId, q);
      if (res?.error) {
        setStatus("error");
        setErrorMsg(res.error);
      } else {
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 2000);
      }
    } catch {
      setStatus("error");
      setErrorMsg("Errore durante il salvataggio");
    }
  };

  return (
    <div>
      <form action={handleSubmit} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <input
          type="number"
          name="q"
          min={0}
          defaultValue={initialQuantity}
          className="input-field"
          style={{ width: "80px", padding: "0.25rem" }}
          required
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={status === "saving"}
          style={{ padding: "0.25rem 0.5rem" }}
        >
          {status === "saving" ? "..." : status === "saved" ? "✓ Salvato" : "Salva"}
        </button>
      </form>
      {status === "error" && (
        <div style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.25rem" }}>
          {errorMsg}
        </div>
      )}
    </div>
  );
}

export function ProductActionButtons({ productId }: { productId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMsg("");
    try {
      const res = await deleteProduct(productId);
      if (res?.error) {
        setErrorMsg(res.error);
      }
    } catch {
      setErrorMsg("Errore durante l'eliminazione del prodotto.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <Link
          href={`/admin/product/${productId}/edit`}
          className="btn btn-secondary"
          style={{ padding: "0.25rem 0.5rem", fontSize: "0.85rem" }}
        >
          Modifica
        </Link>
        <form action={handleDelete}>
          <button
            type="submit"
            className="btn btn-danger"
            disabled={isDeleting}
            style={{ padding: "0.25rem 0.5rem", fontSize: "0.85rem" }}
          >
            {isDeleting ? "..." : "Elimina"}
          </button>
        </form>
      </div>
      {errorMsg && (
        <div
          role="alert"
          style={{
            color: "#fca5a5",
            fontSize: "0.8rem",
            maxWidth: "260px",
            lineHeight: 1.3,
          }}
        >
          {errorMsg}
        </div>
      )}
    </div>
  );
}

export function EditProductForm({
  product,
  categories,
}: {
  product: {
    id: string;
    uniqueCode: string;
    name: string;
    categoryId: string;
    quantity: number;
    description: string | null;
    imageUrl: string | null;
  };
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setError("");
    try {
      const res = await updateProduct(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch {
      setError("Errore imprevisto durante il salvataggio delle modifiche.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      action={handleSubmit}
      style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}
    >
      <input type="hidden" name="id" value={product.id} />

      <div style={{ gridColumn: "span 2" }}>
        <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>
          Codice Univoco (SKU)
        </label>
        <input
          type="text"
          name="uniqueCode"
          defaultValue={product.uniqueCode}
          className="input-field"
          style={{ width: "100%" }}
          required
        />
      </div>

      <div style={{ gridColumn: "span 2" }}>
        <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>
          Nome Prodotto
        </label>
        <input
          type="text"
          name="name"
          defaultValue={product.name}
          className="input-field"
          style={{ width: "100%" }}
          required
        />
      </div>

      <div>
        <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>
          Categoria
        </label>
        <select
          name="categoryId"
          defaultValue={product.categoryId}
          className="input-field"
          style={{ width: "100%" }}
          required
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>
          Giacenza Attuale
        </label>
        <input
          type="number"
          name="quantity"
          min={0}
          defaultValue={product.quantity}
          className="input-field"
          style={{ width: "100%" }}
          required
        />
      </div>

      <div style={{ gridColumn: "span 2" }}>
        <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>
          Descrizione
        </label>
        <textarea
          name="description"
          defaultValue={product.description || ""}
          className="input-field"
          style={{ width: "100%", minHeight: "100px" }}
        />
      </div>

      <div style={{ gridColumn: "span 2" }}>
        <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>
          Immagine Prodotto (Carica un file per sostituire l&apos;attuale)
        </label>
        {product.imageUrl && (
          <div style={{ marginBottom: "1rem" }}>
            <img
              src={product.imageUrl}
              alt="Attuale"
              style={{ height: "150px", borderRadius: "8px", objectFit: "cover" }}
            />
          </div>
        )}
        <input type="file" name="image" accept="image/*" className="input-field" style={{ width: "100%" }} />
      </div>

      {error && (
        <div style={{ gridColumn: "span 2" }}>
          <FeedbackBanner message={error} isError={true} />
        </div>
      )}

      <button
        type="submit"
        className="btn btn-primary"
        disabled={isSubmitting}
        style={{ gridColumn: "span 2", marginTop: "0.5rem" }}
      >
        {isSubmitting ? "Salvataggio in corso..." : "Salva Modifiche"}
      </button>
    </form>
  );
}

export function UpdateOrderStatusForm({
  orderId,
  currentStatus,
  compact = false,
}: {
  orderId: string;
  currentStatus: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState((currentStatus || "NUOVO").toUpperCase());
  const [savingState, setSavingState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setStatus((currentStatus || "NUOVO").toUpperCase());
  }, [currentStatus]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavingState("saving");
    setErrorMsg("");
    try {
      const res = await updateOrderStatus(orderId, status);
      if (res?.error) {
        setSavingState("error");
        setErrorMsg(res.error);
      } else {
        setSavingState("saved");
        router.refresh();
        setTimeout(() => setSavingState("idle"), 2500);
      }
    } catch {
      setSavingState("error");
      setErrorMsg("Errore durante l'aggiornamento dello stato.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}
      >
        <select
          name="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="input-field"
          style={{
            width: "auto",
            minWidth: compact ? "140px" : "180px",
            padding: compact ? "0.4rem 0.75rem" : "0.65rem 1rem",
            fontSize: compact ? "0.85rem" : "0.95rem",
            fontWeight: 600,
          }}
        >
          <option value="NUOVO">Nuovo</option>
          <option value="EVASO">Evaso</option>
        </select>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={savingState === "saving"}
          style={{
            padding: compact ? "0.4rem 0.85rem" : "0.65rem 1.25rem",
            fontSize: compact ? "0.85rem" : "0.95rem",
          }}
        >
          {savingState === "saving"
            ? "Salvataggio..."
            : savingState === "saved"
            ? "✓ Aggiornato"
            : "Cambia Stato"}
        </button>
      </form>
      {savingState === "error" && <FeedbackBanner message={errorMsg} isError={true} />}
    </div>
  );
}

export function EditUserForm({
  user,
}: {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    role: string;
  };
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setMessage("");
    try {
      const res = await updateUser(formData);
      if (res?.error) {
        setIsError(true);
        setMessage(res.error);
      } else {
        setIsError(false);
        setMessage("✅ Informazioni account aggiornate con successo!");
        router.refresh();
      }
    } catch {
      setIsError(true);
      setMessage("Errore imprevisto durante l'aggiornamento dell'account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      action={handleSubmit}
      style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}
    >
      <input type="hidden" name="id" value={user.id} />

      <div>
        <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>
          Nome
        </label>
        <input
          type="text"
          name="firstName"
          defaultValue={user.firstName}
          className="input-field"
          required
        />
      </div>

      <div>
        <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>
          Cognome
        </label>
        <input
          type="text"
          name="lastName"
          defaultValue={user.lastName}
          className="input-field"
          required
        />
      </div>

      <div>
        <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>
          Username
        </label>
        <input
          type="text"
          name="username"
          defaultValue={user.username}
          className="input-field"
          required
        />
      </div>

      <div>
        <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>
          Email
        </label>
        <input
          type="email"
          name="email"
          defaultValue={user.email}
          className="input-field"
          required
        />
      </div>

      <div>
        <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>
          Ruolo Account
        </label>
        <select name="role" defaultValue={user.role} className="input-field" required>
          <option value="USER">Cliente (USER)</option>
          <option value="ADMIN">Amministratore (ADMIN)</option>
        </select>
      </div>

      <div>
        <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>
          Nuova Password (lascia vuoto per non modificarla)
        </label>
        <input
          type="text"
          name="password"
          placeholder="Inserisci nuova password..."
          className="input-field"
        />
      </div>

      {message && (
        <div style={{ gridColumn: "span 2" }}>
          <FeedbackBanner message={message} isError={isError} />
        </div>
      )}

      <button
        type="submit"
        className="btn btn-primary"
        disabled={isSubmitting}
        style={{ gridColumn: "span 2", marginTop: "0.5rem" }}
      >
        {isSubmitting ? "Salvataggio in corso..." : "Salva Informazioni Account"}
      </button>
    </form>
  );
}
