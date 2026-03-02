import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import fs from "fs";
import path from "path";
import { appendToSheet, AuditRecord } from '@/lib/google-sheets';
import { isTrustedOrigin } from '@/lib/rate-limit';

// --- Interfaces ---
interface UserPayload {
    nombre?: string;
    apellido?: string;
    tipo_doc?: string;
    numero_doc?: string;
    numero_telefono?: string;
    correo_electronico?: string;
    wa_link?: string;
    empresa?: string;
    monto_maximo?: string | number;
}

interface PromoPayload {
    nombre_comercial: string;
    nombre_descuento: string;
    tipo_promocion: string;
}

interface PromoRequestPayload {
    user: UserPayload;
    promo: PromoPayload;
    providerEmail: string;
}

// --- Helpers ---

/**
 * Intenta recuperar el teléfono y link de WA más actualizados del JSON local.
 */
function enrichUserDataWithLocalStore(user: UserPayload): UserPayload {
    if (!user.numero_doc) return user;

    try {
        const usersFile = path.join(process.cwd(), 'src', 'lib', 'data', 'users.json');
        if (fs.existsSync(usersFile)) {
            const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
            const freshUser = users.find((u: any) => u.numero_doc === user.numero_doc);
            if (freshUser) {
                user.numero_telefono = freshUser.numero_telefono || user.numero_telefono;
                user.wa_link = freshUser.wa_link || user.wa_link;
            }
        }
    } catch (err) {
        console.error("Failed to read fresh user data for promo email request:", err);
    }
    return user;
}

/**
 * Genera el cuerpo del correo en HTML para promociones.
 */
function generatePromoEmailHtml(user: UserPayload, promo: PromoPayload): string {
    const formattedMonto = user.monto_maximo ? new Intl.NumberFormat('es-CO').format(Number(user.monto_maximo)) : '0';

    const patientName = user.nombre || 'paciente';
    const waMessage = `¡Hola ${patientName}! 👋 Te escribimos desde ${promo.nombre_comercial} 🏥 porque estás interesado en usar tu beneficio de Welli Benefits para redimir la promoción "${promo.nombre_descuento}" con nosotros. ¿En qué podemos ayudarte?`;

    let finalWaLink = user.wa_link || "";
    if (finalWaLink) {
        finalWaLink += (finalWaLink.includes('?') ? '&' : '?') + `text=${encodeURIComponent(waMessage)}`;
    }

    const waButtonHtml = finalWaLink
        ? `
        <div style="text-align: center; margin-top: 35px;">
            <a href="${finalWaLink}" style="background-color: #25D366; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(37, 211, 102, 0.25);">
                <span style="font-size: 18px; margin-right: 5px; vertical-align: middle;">💬</span> Enviar mensaje directo por WhatsApp
            </a>
        </div>`
        : '';

    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; padding: 0; border: 1px solid #eaeaea; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
        <div style="background: linear-gradient(135deg, #FFC800 0%, #FF9000 100%); padding: 40px 20px; text-align: center; border-bottom: 4px solid #8C65C9;">
            <img src="cid:welli-logo" alt="Welli Benefits" style="width: 130px; height: auto; display: block; margin: 0 auto 20px auto;" onerror="this.src='https://assets-global.website-files.com/plugins/Basic/assets/placeholder.60f9b1840c.svg'; this.style.display='none';">
            <h2 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">¡Nueva Solicitud de Promoción!</h2>
            <p style="color: #fffbeb; font-size: 16px; margin: 12px 0 0 0; font-weight: bold;">Un usuario de Welli Benefits quiere solicitar tu oferta exclusiva.</p>
        </div>
        
        <div style="padding: 30px;">
            <div style="background-color: #f8fafc; padding: 25px; border-radius: 10px; margin-bottom: 25px; border: 1px solid #e2e8f0; border-left: 4px solid #FFC800;">
                <h3 style="margin-top: 0; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Información del Paciente / Usuario</h3>
                <ul style="list-style: none; padding: 0; margin: 0; line-height: 1.8;">
                    <li><strong>Nombre Completo:</strong> ${user.nombre || ''} ${user.apellido || ''}</li>
                    <li><strong>Cédula / Documento:</strong> ${user.tipo_doc || 'CC'} ${user.numero_doc || 'No proporcionado'}</li>
                    <li><strong>Correo Electrónico:</strong> ${user.correo_electronico || 'No proporcionado'}</li>
                    <li><strong>Número de Celular:</strong> ${user.numero_telefono || 'No proporcionado'}</li>
                    <li><strong>Empresa:</strong> ${user.empresa || 'No proporcionada'}</li>
                    <li><strong>Cupo Máximo Disponible:</strong> $${formattedMonto}</li>
                </ul>
            </div>

            <div style="background-color: #fffbeb; padding: 25px; border-radius: 10px; border-left: 4px solid #FFC800; border-top: 1px solid #fef3c7; border-right: 1px solid #fef3c7; border-bottom: 1px solid #fef3c7;">
                <h3 style="margin-top: 0; color: #92400e; display: flex; align-items: center; gap: 8px; font-size: 18px;">
                    Promoción Solicitada
                </h3>
                <div style="background-color: white; padding: 15px; border-radius: 6px; margin-top: 15px; border: 1px solid #fde68a; text-align: center;">
                    <p style="margin: 0 0 8px 0; font-size: 15px; color: #854d0e; font-weight: bold;">${promo.nombre_comercial}</p>
                    <p style="margin: 0 0 12px 0; font-size: 20px; font-weight: 900; color: #1e293b;">${promo.nombre_descuento}</p>
                    <span style="background-color: #FFC800; padding: 6px 12px; border-radius: 20px; color: #92400e; font-weight: bold; display: inline-block;">Oferta Welli: ${promo.tipo_promocion}</span>
                </div>
            </div>

            ${waButtonHtml}

            <div style="margin-top: 40px; text-align: center; font-size: 13px; color: #64748b; border-top: 1px dashed #cbd5e1; padding-top: 20px;">
                <div style="margin-bottom: 10px;">
                    <img src="cid:welli-logo" alt="Welli" style="width: 100px; height: auto; opacity: 0.6; display: block; margin: 0 auto;" onerror="this.style.display='none';">
                </div>
                <p style="margin: 0 0 5px 0;">Este correo es generado automáticamente por el sistema de promociones de <strong>Welli Benefits</strong>.</p>
                <p style="margin: 0;">© ${new Date().getFullYear()} Welli. Todos los derechos reservados.</p>
            </div>
        </div>
    </div>
    `;
}

/**
 * Podríamos hacer un log de la promoción a un archivo o una tabla separada. Como simplificación lo mandaremos al mismo auditoria o traker.
 */
async function logPromoToGoogleSheets(payload: PromoRequestPayload) {
    const { user, promo } = payload;
    const now = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' });

    const records: AuditRecord[] = [
        {
            sheetName: 'Auditoria Citas',
            row: [
                now,
                `${user.nombre || ''} ${user.apellido || ''}`.trim(),
                user.numero_doc || 'No proporcionado',
                user.numero_telefono || 'No proporcionado',
                promo.nombre_comercial || 'Desconocido',
                `[PROMOCIÓN] ${promo.nombre_descuento}`,
                'No aplica',
                `Tipo promo: ${promo.tipo_promocion}`,
                'Enviado Promo'
            ]
        },
        {
            sheetName: 'traker_mensajes',
            row: [
                user.nombre || '',                  // nombre
                user.apellido || '',                // apellido
                user.tipo_doc || 'CC',              // tipo_doc
                user.numero_doc || 'No',            // numero_doc
                user.numero_telefono || 'No',       // numero_telefono
                user.correo_electronico || 'No',    // correo_electronico
                user.empresa || 'No',               // empresa
                promo.nombre_comercial || 'Desconocido', // nombre_comercial
                'Promoción',                        // categoria
                'No',                               // macro_sede
                promo.nombre_descuento,             // procedimiento (enviamos que está consultando)
                'No',                               // disponibilidad
                `Promo: ${promo.tipo_promocion}`,   // comentarios
                now                                 // time_stamp
            ]
        }
    ];

    try {
        await appendToSheet(records);
    } catch (error) {
        console.error("Failed to append promo records:", error);
    }
}

// --- Main Route Handler ---

export async function POST(req: Request) {
    try {
        // Bloquear bots o solicitudes de orígenes desconocidos (Postman, scripts)
        if (!isTrustedOrigin(req as any)) {
            return NextResponse.json(
                { message: 'Permiso denegado. Origen desconocido o no autorizado.' },
                { status: 403 }
            );
        }

        const body: PromoRequestPayload = await req.json();

        if (!body.user || !body.promo || !body.providerEmail) {
            return NextResponse.json(
                { message: 'Missing required fields: user, promo, or providerEmail.' },
                { status: 400 }
            );
        }

        // Enrich user with fresh data
        console.log("[route-promo] Enriching user data...");
        const enrichedUser = enrichUserDataWithLocalStore(body.user);
        body.user = enrichedUser;

        const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;

        if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
            console.error('Email misconfiguration. Missing GMAIL_USER or GMAIL_APP_PASSWORD environment variables.');
            return NextResponse.json(
                { message: 'Server configuration error. Contact administrator.' },
                { status: 500 }
            );
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
        });

        // HTML Setup
        console.log("[route-promo] Generating email HTML...");
        const htmlBody = generatePromoEmailHtml(body.user, body.promo);

        const patientName = `${body.user.nombre || 'Paciente'} ${body.user.apellido || ''}`.trim();
        const fallbackText = `Nueva solicitud de promoción para ${body.promo.nombre_comercial}. Paciente: ${patientName}, Contacto: ${body.user.numero_telefono || 'No'}, Cupo: $${body.user.monto_maximo || '0'}. Promoción: ${body.promo.nombre_descuento}`;

        // Dispatch Email
        console.log("[route-promo] Waiting for transporter to send provider email...");
        const info = await transporter.sendMail({
            from: `"Welli Benefits Promociones" <${GMAIL_USER}>`,
            to: body.providerEmail,
            subject: `[Welli] Solicitud de Promoción: ${patientName} - ${body.promo.nombre_comercial}`,
            text: fallbackText,
            html: htmlBody,
            attachments: [{
                filename: 'welli-logo-white.png',
                path: path.join(process.cwd(), 'public', 'images', 'welli-logo-white.png'),
                cid: 'welli-logo' // mismo cid usado en el src del HTML
            }]
        });

        console.log('[route-promo] Promo Email sent successfully: %s', info.messageId);

        // Async auditing without blocking response
        console.log("[route-promo] Appending logs to Google Sheets asynchronously...");
        await logPromoToGoogleSheets(body);
        console.log("[route-promo] Google Sheets log complete. Returning 200...");

        return NextResponse.json({ success: true, messageId: info.messageId }, { status: 200 });

    } catch (error: any) {
        console.error('Error processing promo request:', error);
        return NextResponse.json(
            { message: 'Failed to process promo request.', error: error.message },
            { status: 500 }
        );
    }
}
