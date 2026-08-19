import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      return NextResponse.json({ 
        success: false, 
        error: "Le variabili SMTP non sono ancora state configurate o lette da Vercel." 
      }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
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

    // 1. Testa solo se la connessione e le credenziali sono accettate da Register
    await transporter.verify();

    // 2. Prova a inviare un'email finta a te stesso
    const info = await transporter.sendMail({
      from: `"Test Vercel" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: "Test connessione Register.it - OK",
      text: "Se stai leggendo questa email, Vercel riesce a comunicare perfettamente con il server SMTP di Register.it!",
    });

    return NextResponse.json({ 
      success: true, 
      message: "Connessione SMTP verificata ed email inviata con successo!", 
      messageId: info.messageId,
      host: process.env.SMTP_HOST,
      user: process.env.SMTP_USER
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      host: process.env.SMTP_HOST,
      user: process.env.SMTP_USER
    }, { status: 500 });
  }
}
