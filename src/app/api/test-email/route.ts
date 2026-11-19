import { NextResponse } from 'next/server';
import {
  createSmtpTransporter,
  DEFAULT_SENDER_EMAIL,
  DEFAULT_ADMIN_ORDER_EMAIL,
} from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET() {
  const host = (process.env.SMTP_HOST || "smtp.gmail.com").trim();
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = (process.env.SMTP_USER || DEFAULT_SENDER_EMAIL).trim();
  const recipient = (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_ORDER_EMAIL).trim();

  try {
    if (!process.env.SMTP_PASS) {
      return NextResponse.json({ 
        success: false, 
        error: "La variabile SMTP_PASS non è configurata nelle variabili d'ambiente." 
      }, { status: 500 });
    }

    const transporter = createSmtpTransporter();

    // 1. Testa se la connessione e le credenziali sono accettate dal server SMTP
    await transporter.verify();

    // 2. Invia un'email di test dal mittente (deltaservice.ecommerce@gmail.com) al destinatario ordini (ordine@deltaserviceitalia.com)
    const info = await transporter.sendMail({
      from: `"Delta Service Gestionale" <${user}>`,
      to: recipient,
      subject: "Test connessione SMTP Delta Service - OK",
      text: `Se stai leggendo questa email, l'applicazione riesce a inviare correttamente da ${user} a ${recipient}!`,
    });

    return NextResponse.json({ 
      success: true, 
      message: "Connessione SMTP verificata ed email di test inviata con successo!", 
      messageId: info.messageId,
      host,
      port,
      secure: port === 465,
      from: user,
      sentTo: recipient
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      code: error.code,
      response: error.response,
      host,
      port,
      secure: port === 465,
      user
    }, { status: 500 });
  }
}
