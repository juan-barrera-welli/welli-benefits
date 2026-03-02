import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { referrerName, colleagueName, colleagueEmail } = body;

        // Basic validation
        if (!referrerName || !colleagueName || !colleagueEmail) {
            return NextResponse.json(
                { message: 'Faltan campos obligatorios.' },
                { status: 400 }
            );
        }

        const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;

        if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
            console.error('Email misconfiguration. Missing variables.');
            return NextResponse.json(
                { message: 'Error de configuración del servidor.' },
                { status: 500 }
            );
        }

        // Configure Nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: GMAIL_USER,
                pass: GMAIL_APP_PASSWORD,
            },
        });

        // Construct HTML email body
        const htmlBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; padding: 20px; border: 1px solid #eaeaea; border-radius: 12px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <img src="https://welli.com.co/wp-content/uploads/2023/10/Logo-Welli-Morado.png" alt="Welli Benefits" style="height: 40px; margin-bottom: 20px;" />
                    <h2 style="color: #4C7DFF; margin: 0; font-size: 24px;">¡Hola ${colleagueName}!</h2>
                    <p style="color: #666; font-size: 16px; margin-top: 10px;">Tu colega <strong>${referrerName}</strong> te ha invitado a unirte a Welli Benefits.</p>
                </div>

                <div style="background-color: #f8fafc; padding: 25px; border-radius: 12px; margin-bottom: 30px; text-align: center;">
                    <h3 style="margin-top: 0; color: #1e293b; font-size: 20px;">Financia tu bienestar hoy mismo</h3>
                    <p style="color: #475569; font-size: 15px; line-height: 1.6;">
                        Con Welli puedes acceder a tratamientos de salud, odontología, estética y bienestar, financiándolos de manera fácil, rápida y sin costos ocultos.
                    </p>
                    <a href="https://welli.com.co/" style="display: inline-block; margin-top: 20px; padding: 14px 30px; background-color: #8C65C9; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 50px; font-size: 16px;">
                        Descubre nuestros beneficios
                    </a>
                </div>

                <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 20px;">
                    <p>Has recibido este correo porque ${referrerName} pensó que te podría interesar financiar tu bienestar con Welli.</p>
                    <p>© ${new Date().getFullYear()} Welli. Todos los derechos reservados.</p>
                </div>
            </div>
        `;

        // Send Email
        const info = await transporter.sendMail({
            from: `"Welli Benefits Invitación" <${GMAIL_USER}>`,
            to: colleagueEmail,
            subject: `${referrerName} te invita a conocer Welli Benefits 🌟`,
            text: `Hola ${colleagueName}, tu colega ${referrerName} te invita a unirte a Welli Benefits para financiar tu salud y bienestar. Visita https://welli.com.co para aplicar.`,
            html: htmlBody,
        });

        console.log('Referral email sent successfully: %s', info.messageId);

        return NextResponse.json({ success: true, messageId: info.messageId }, { status: 200 });
    } catch (error: unknown) {
        const err = error as Error;
        console.error('Error sending referral email:', err);
        return NextResponse.json(
            { message: 'Error al enviar la invitación.', error: err.message },
            { status: 500 }
        );
    }
}
