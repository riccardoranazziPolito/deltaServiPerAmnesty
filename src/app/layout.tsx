import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import MiniCart from "@/components/MiniCart";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "B2B Management",
  description: "E-Commerce aziendale interno",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/catalogo" className="btn btn-primary" style={{ background: 'transparent', boxShadow: 'none', border: '1px solid var(--border-color)' }}>
              Catalogo
            </Link>
            <Link href="/carrello" className="btn btn-primary" style={{ background: 'transparent', boxShadow: 'none', border: '1px solid var(--border-color)' }}>
              Carrello
            </Link>
            <Link href="/login" className="btn btn-primary">
              Accedi
            </Link>
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
