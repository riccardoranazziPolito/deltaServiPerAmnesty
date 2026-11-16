import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import MiniCart from "@/components/MiniCart";
import { getSession, logout } from "@/app/actions/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Amnesty International • Delta Service B2B",
  description: "Portale B2B per la gestione ordini e materiali",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="it">
      <body className={inter.className}>
        <nav style={{
          padding: '0.85rem 2rem',
          borderBottom: '2px solid var(--accent-primary)',
          background: '#000000',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            <img
              src="/logo.webp"
              alt="Amnesty International"
              style={{ height: '44px', width: 'auto', borderRadius: '4px', display: 'block' }}
            />
            <span>Delta Service</span>
          </Link>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {session ? (
              <>
                <Link href="/catalogo" className="btn btn-secondary">
                  Catalogo
                </Link>
                <Link href="/ordini" className="btn btn-secondary">
                  I Miei Ordini
                </Link>
                <Link href="/carrello" className="btn btn-secondary">
                  Carrello
                </Link>
                {session.role === "ADMIN" && (
                  <Link href="/admin" className="btn btn-secondary" style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}>
                    Admin
                  </Link>
                )}
                <form action={logout}>
                  <button type="submit" className="btn btn-danger">
                    Esci
                  </button>
                </form>
              </>
            ) : (
              <Link href="/login" className="btn btn-primary">
                Accedi
              </Link>
            )}
          </div>
        </nav>
        <main className="container animate-fade-in" style={{ padding: '2rem 1.5rem', flex: 1 }}>
          {children}
        </main>
        <MiniCart />
        <footer style={{
          textAlign: 'center',
          padding: '2rem',
          color: 'var(--text-secondary)',
          borderTop: '1px solid var(--border-color)',
          background: '#050505',
          marginTop: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <img
            src="/logo.webp"
            alt="Amnesty International"
            style={{ height: '32px', width: 'auto', borderRadius: '4px' }}
          />
          <span>© {new Date().getFullYear()} Delta Service • Amnesty International. Tutti i diritti riservati.</span>
        </footer>
      </body>
    </html>
  );
}
