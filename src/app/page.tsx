import Link from "next/link";

export default function Home() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '70vh',
      textAlign: 'center',
      gap: '2rem'
    }}>
      <div className="glass-panel" style={{ maxWidth: '800px' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', background: 'linear-gradient(to right, var(--accent-primary), #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Gestione Ordini Aziendali
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
          Il portale B2B esclusivo per l'approvvigionamento dei materiali. 
          Verifica le giacenze in tempo reale ed effettua i tuoi ordini in pochi click.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/login" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
            Accedi al Portale
          </Link>
          <Link href="/catalogo" className="btn" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', background: 'var(--glass-bg)', border: 'var(--glass-border)', color: 'var(--text-primary)' }}>
            Sfoglia Catalogo
          </Link>
        </div>
      </div>
    </div>
  );
}
