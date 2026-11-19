"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, null);

  return (
    <div className="flex-center" style={{ minHeight: '60vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <img
            src="/logo.png"
            alt="Amnesty International Italia"
            style={{ height: '64px', width: 'auto', borderRadius: '6px' }}
          />
        </div>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Accesso Portale</h2>
        
        {state?.error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid var(--danger)', padding: '1rem', borderRadius: '8px', color: '#fca5a5', marginBottom: '1.5rem', textAlign: 'center' }}>
            {state.error}
          </div>
        )}

        <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label htmlFor="username" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Username</label>
            <input
              type="text"
              id="username"
              name="username"
              className="input-field"
              required
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="input-field"
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={isPending} style={{ marginTop: '0.5rem' }}>
            {isPending ? 'Accesso in corso...' : 'Accedi'}
          </button>
        </form>
      </div>
    </div>
  );
}
