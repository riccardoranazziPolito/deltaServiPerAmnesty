import nodemailer from 'nodemailer';

// Funzione helper per ottenere il trasportatore (configurazione fittizia con Ethereal per il dev locale)
async function getTransporter() {
  // In un ambiente di produzione reale, qui metteresti le credenziali SMTP (es. Register) lette dal .env
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  // Ambiente di sviluppo: crea un account di test Ethereal
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

export async function sendOrderConfirmation(
  orderId: string,
  userEmail: string,
  adminEmail: string,
  shippingAddress: string,
  items: { productName: string; uniqueCode: string; quantity: number }[]
) {
  const transporter = await getTransporter();

  // Costruisci il corpo del messaggio
  const itemsList = items.map(i => `- ${i.quantity}x ${i.productName} (SKU: ${i.uniqueCode})`).join('\n');
  
  const textContent = `
Nuovo Ordine Confermato! (ID Ordine: #${orderId.slice(-6).toUpperCase()})

Indirizzo di spedizione:
${shippingAddress}

Materiali ordinati:
${itemsList}

Grazie per aver utilizzato il nostro sistema di gestione B2B!
  `;

  // 1. Invia email all'utente (Cliente)
  const userMailOptions = {
    from: `"Delta Service Gestionale" <${process.env.SMTP_USER}>`,
    to: userEmail,
    subject: `Conferma Ordine #${orderId.slice(-6).toUpperCase()}`,
    text: `Ciao,\nEcco il riepilogo del tuo ordine:\n\n` + textContent,
  };

  const userEmailInfo = await transporter.sendMail(userMailOptions);
  
  // 2. Invia email all'Amministratore
  const adminMailOptions = {
    from: `"Delta Service Gestionale" <${process.env.SMTP_USER}>`,
    to: adminEmail,
    subject: `[NUOVO ORDINE] Ricevuto ordine #${orderId.slice(-6).toUpperCase()}`,
    text: `Un cliente ha appena effettuato un ordine.\nEmail cliente: ${userEmail}\n\n` + textContent,
  };

  const adminEmailInfo = await transporter.sendMail(adminMailOptions);

  // In ambiente di sviluppo, stampiamo il link per visualizzare l'email inviata
  if (process.env.NODE_ENV !== 'production') {
    console.log("=============================");
    console.log("Anteprima Email Cliente: %s", nodemailer.getTestMessageUrl(userEmailInfo));
    console.log("Anteprima Email Admin: %s", nodemailer.getTestMessageUrl(adminEmailInfo));
    console.log("=============================");
  }
}
