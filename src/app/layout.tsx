import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import MiniCart from "@/components/MiniCart";
import { getSession, logout } from "@/app/actions/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "B2B Management",
  description: "E-Commerce aziendale interno",
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
          padding: '1rem 2rem',
          borderBottom: 'var(--glass-border)',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Delta Service
          </Link>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {session ? (
              <>
                <Link href="/catalogo" className="btn btn-secondary">
                  Catalogo
                </Link>
                <Link href="/carrello" className="btn btn-secondary">
                  Carrello
                </Link>
                {session.role === "ADMIN" && (
                  <Link href="/admin" className="btn btn-secondary" style={{ borderColor: 'var(--accent-primary)' }}>
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
          marginTop: 'auto'
        }}>
          © {new Date().getFullYear()} Delta Service. Tutti i diritti riservati.
        </footer>
      </body>
    </html>
  );
}
