import nodemailer from 'nodemailer';

export const DEFAULT_SENDER_EMAIL = "deltaservice.ecommerce@gmail.com";
export const DEFAULT_ADMIN_ORDER_EMAIL = "ordine@deltaserviceitalia.com";

export function createSmtpTransporter() {
  const host = (process.env.SMTP_HOST || "smtp.gmail.com").trim();
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = (process.env.SMTP_USER || DEFAULT_SENDER_EMAIL).trim();
  const rawPass = (process.env.SMTP_PASS || "").trim();
  // Google App Passwords vengono mostrate con spazi (xxxx xxxx xxxx xxxx): rimuoviamoli automaticamente per Gmail
  const pass =
    host.includes("gmail") || user.endsWith("@gmail.com")
      ? rawPass.replace(/\s+/g, "")
      : rawPass;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true per porta 465 (SSL), false per altre porte come 587 (STARTTLS)
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

// Funzione helper per ottenere il trasportatore
async function getTransporter() {
  // Se SMTP_PASS è configurato (su Vercel o nel .env locale), usa sempre il server SMTP reale (es. Gmail)
  if (process.env.SMTP_PASS) {
    return {
      transporter: createSmtpTransporter(),
      isTestAccount: false,
    };
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Variabile d'ambiente SMTP_PASS mancante in produzione.");
  }

  // Fallback solo in sviluppo locale se non è configurato SMTP_PASS: account di test Ethereal
  const testAccount = await nodemailer.createTestAccount();
  return {
    transporter: nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    }),
    isTestAccount: true,
  };
}

export async function sendOrderConfirmation(
  orderId: string,
  userEmail: string,
  adminEmail: string,
  shippingAddress: string,
  items: { productName: string; uniqueCode: string; quantity: number }[],
  notes?: string | null
) {
  const { transporter, isTestAccount } = await getTransporter();
  const senderEmail = (process.env.SMTP_USER || DEFAULT_SENDER_EMAIL).trim();

  // Costruisci il corpo del messaggio
  const itemsList = items
    .map((i) => `- ${i.quantity}x ${i.productName} (SKU: ${i.uniqueCode})`)
    .join("\n");
  const notesSection = notes ? `\nNote per la consegna:\n${notes}\n` : "";

  const textContent = `
Nuovo Ordine Confermato! (ID Ordine: #${orderId.slice(-6).toUpperCase()})

Indirizzo di spedizione:
${shippingAddress}
${notesSection}
Materiali ordinati:
${itemsList}

Grazie per aver utilizzato il nostro sistema di gestione B2B!
  `;

  // 1. Invia email all'utente (Cliente)
  if (userEmail) {
    try {
      const userMailOptions = {
        from: `"Delta Service Gestionale" <${senderEmail}>`,
        to: userEmail,
        subject: `Conferma Ordine #${orderId.slice(-6).toUpperCase()}`,
        text: `Ciao,\nEcco il riepilogo del tuo ordine:\n\n` + textContent,
      };
      const userEmailInfo = await transporter.sendMail(userMailOptions);
      if (isTestAccount) {
        console.log("Anteprima Email Cliente: %s", nodemailer.getTestMessageUrl(userEmailInfo));
      }
    } catch (err) {
      console.error("Errore invio email al cliente:", err);
    }
  }

  // 2. Invia email all'Amministratore (default: ordine@deltaserviceitalia.com)
  const targetAdminEmail = (adminEmail || process.env.ADMIN_EMAIL || DEFAULT_ADMIN_ORDER_EMAIL).trim();
  if (targetAdminEmail) {
    try {
      const adminMailOptions = {
        from: `"Delta Service Gestionale" <${senderEmail}>`,
        to: targetAdminEmail,
        subject: `[NUOVO ORDINE] Ricevuto ordine #${orderId.slice(-6).toUpperCase()}`,
        text:
          `Un cliente ha appena effettuato un ordine.\nEmail cliente: ${userEmail}\n\n` +
          textContent,
      };
      const adminEmailInfo = await transporter.sendMail(adminMailOptions);
      if (isTestAccount) {
        console.log("Anteprima Email Admin: %s", nodemailer.getTestMessageUrl(adminEmailInfo));
      }
    } catch (err) {
      console.error("Errore invio email all'amministratore:", err);
    }
  }
}
