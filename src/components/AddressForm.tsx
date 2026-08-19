"use client";

import { useState } from "react";

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

export default function AddressForm({ recipients }: { recipients: Recipient[] }) {
  const [selectedId, setSelectedId] = useState<string>(recipients.length > 0 ? recipients[0].id : "new");

  const isNew = selectedId === "new";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {recipients.length > 0 && (
        <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            Seleziona Destinatario dalla Rubrica
          </label>
          <select 
            name="savedRecipientId" 
            className="input-field" 
            value={selectedId} 
            onChange={(e) => setSelectedId(e.target.value)}
            style={{ fontWeight: 'bold' }}
          >
            {recipients.map(r => (
              <option key={r.id} value={r.id}>
                {r.firstName} {r.lastName} {r.company ? `(${r.company})` : ''} - {r.address}, {r.city} ({r.province})
              </option>
            ))}
            <option value="new">+ Inserisci Nuovo Destinatario</option>
          </select>
        </div>
      )}

      {/* Se non ci sono destinatari, dobbiamo comunque inviare "new" per attivare la logica di salvataggio */}
      {recipients.length === 0 && <input type="hidden" name="savedRecipientId" value="new" />}

      {isNew && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.3s ease-out' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '0.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Nome Destinatario</label>
              <input type="text" name="firstName" className="input-field" required={isNew} placeholder="Es. Mario" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Cognome Destinatario</label>
              <input type="text" name="lastName" className="input-field" required={isNew} placeholder="Es. Rossi" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Azienda (Opzionale)</label>
              <input type="text" name="company" className="input-field" placeholder="Es. Delta Service SRL" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Indirizzo (Via/Piazza)</label>
              <input type="text" name="address" className="input-field" required={isNew} placeholder="Es. Via Roma" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Civico</label>
              <input type="text" name="civic" className="input-field" required={isNew} placeholder="Es. 10/A" />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>CAP</label>
              <input type="text" name="zipCode" className="input-field" required={isNew} placeholder="Es. 00100" maxLength={5} pattern="[0-9]{5}" title="Il CAP deve essere di 5 cifre" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Città</label>
              <input type="text" name="city" className="input-field" required={isNew} placeholder="Es. Roma" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Provincia</label>
              <select name="province" className="input-field" required={isNew}>
                <option value="">Seleziona...</option>
                {['AG','AL','AN','AO','AQ','AR','AP','AT','AV','BA','BT','BL','BN','BG','BI','BO','BZ','BS','BR','CA','CL','CB','CI','CE','CT','CZ','CH','CO','CS','CR','KR','CN','EN','FM','FE','FI','FG','FC','FR','GE','GO','GR','IM','IS','SP','LT','LE','LC','LI','LO','LU','MC','MN','MS','MT','VS','ME','MI','MO','MB','NA','NO','NU','OG','OT','OR','PD','PA','PR','PV','PG','PU','PE','PC','PI','PT','PN','PZ','PO','RG','RA','RC','RE','RI','RN','RM','RO','SA','SS','SV','SI','SR','SO','TA','TE','TR','TO','TP','TN','TV','TS','UD','VA','VE','VB','VC','VR','VV','VI','VT'].map(prov => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
