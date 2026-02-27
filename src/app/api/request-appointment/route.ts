import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import fs from "fs";
import path from "path";
import { appendToSheet, AuditRecord } from '@/lib/google-sheets';

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

interface ProviderPayload {
    name: string;
    specialty: string;
    locations?: { department: string }[];
}

interface AppointmentRequestPayload {
    user: UserPayload;
    provider: ProviderPayload;
    providerEmail: string;
    procedure: string;
    preferredTime: string;
    comments: string;
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
        console.error("Failed to read fresh user data for email request:", err);
    }
    return user;
}

/**
 * Genera el cuerpo del correo en HTML.
 */
function generateEmailHtml(user: UserPayload, provider: ProviderPayload, procedure: string, preferredTime: string, comments: string): string {
    const formattedMonto = user.monto_maximo ? new Intl.NumberFormat('es-CO').format(Number(user.monto_maximo)) : '0';

    const patientName = user.nombre || 'paciente';
    const waMessage = `¡Hola ${patientName}! 👋 Te escribimos desde ${provider.name} 🏥 porque estás interesado en usar tu beneficio de Welli Benefits y agendar una cita con nosotros. ¿En qué podemos ayudarte?`;

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

    const commentsHtml = comments ? `
    <div style="margin-top: 15px;">
        <p style="margin: 0 0 5px 0; font-size: 14px; color: #92400e; font-weight: bold;">Comentarios del paciente:</p>
        <p style="margin: 0; font-style: italic; color: #b45309; background: white; padding: 12px; border-radius: 6px; border-left: 2px solid #fcd34d;">"${comments.replace(/\\n/g, '<br>')}"</p>
    </div>` : '';

    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; padding: 0; border: 1px solid #eaeaea; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
        <div style="background: linear-gradient(135deg, #FFC800 0%, #FF9000 100%); padding: 40px 20px; text-align: center; border-bottom: 4px solid #8C65C9;">
            <img src="cid:welli-logo" alt="Welli Benefits" style="width: 130px; height: auto; display: block; margin: 0 auto 20px auto;" onerror="this.src='https://assets-global.website-files.com/plugins/Basic/assets/placeholder.60f9b1840c.svg'; this.style.display='none';">
            <h2 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">¡Nueva Solicitud de Welli Benefits!</h2>
            <p style="color: #fffbeb; font-size: 15px; margin: 12px 0 0 0;">Una solicitud de atención ha sido generada desde nuestra plataforma.</p>
        </div>
        
        <div style="padding: 30px;">
            <div style="background-color: #f8fafc; padding: 25px; border-radius: 10px; margin-bottom: 25px; border: 1px solid #e2e8f0; border-left: 4px solid #FFC800;">
                <h3 style="margin-top: 0; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Información del Paciente</h3>
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
                    Servicio Solicitado
                </h3>
                <div style="background-color: white; padding: 15px; border-radius: 6px; margin-top: 15px; border: 1px solid #fde68a;">
                    <p style="margin: 0 0 8px 0; font-size: 15px;"><strong>Clínica:</strong> ${provider.name}</p>
                    <p style="margin: 0 0 8px 0; font-size: 15px;"><strong>Especialidad:</strong> ${provider.specialty}</p>
                    <p style="margin: 0 0 8px 0; font-size: 15px;"><strong>Procedimiento:</strong> <span style="background-color: #fef08a; padding: 2px 6px; border-radius: 4px; color: #854d0e;">${procedure || 'No especificado'}</span></p>
                    <p style="margin: 0 0 8px 0; font-size: 15px;"><strong>Disponibilidad preferida:</strong> ${preferredTime || 'No especificada'}</p>
                </div>
                ${commentsHtml}
            </div>

            ${waButtonHtml}

            <div style="margin-top: 40px; text-align: center; font-size: 13px; color: #64748b; border-top: 1px dashed #cbd5e1; padding-top: 20px;">
                <div style="margin-bottom: 10px;">
                    <img src="cid:welli-logo" alt="Welli" style="width: 100px; height: auto; opacity: 0.6; display: block; margin: 0 auto;" onerror="this.style.display='none';">
                </div>
                <p style="margin: 0 0 5px 0;">Este correo es generado automáticamente por el sistema de reservas de <strong>Welli Benefits</strong>.</p>
                <p style="margin: 0;">© ${new Date().getFullYear()} Welli. Todos los derechos reservados.</p>
            </div>
        </div>
    </div>
    `;
}

/**
 * Centraliza la escritura a las dos hojas de cálculo de Google Sheets.
 */
async function logToGoogleSheets(payload: AppointmentRequestPayload) {
    const { user, provider, procedure, preferredTime, comments } = payload;
    const now = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' });

    const records: AuditRecord[] = [
        {
            sheetName: 'Auditoria Citas',
            row: [
                now,
                `${user.nombre || ''} ${user.apellido || ''}`.trim(),
                user.numero_doc || 'No proporcionado',
                user.numero_telefono || 'No proporcionado',
                provider.name || 'Desconocido',
                procedure || 'Consulta General',
                preferredTime || 'No especificada',
                comments || 'Ninguno',
                'Enviado'
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
                provider.name || 'Desconocido',     // nombre_comercial
                provider.specialty || 'No',         // categoria
                provider.locations && provider.locations.length > 0 ? provider.locations[0].department : 'No', // macro_sede
                procedure || 'Consulta General',    // procedimiento
                preferredTime || 'No',              // disponibilidad
                comments || 'Ninguno',              // comentarios
                now                                 // time_stamp
            ]
        }
    ];

    try {
        await appendToSheet(records);
    } catch (error) {
        console.error("Failed to append audit records:", error);
    }
}

// --- Main Route Handler ---

export async function POST(req: Request) {
    try {
        const body: AppointmentRequestPayload = await req.json();

        if (!body.user || !body.provider || !body.providerEmail) {
            return NextResponse.json(
                { message: 'Missing required fields: user, provider, or providerEmail.' },
                { status: 400 }
            );
        }

        // Enrich user with fresh data
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
        const htmlBody = generateEmailHtml(
            body.user,
            body.provider,
            body.procedure,
            body.preferredTime,
            body.comments
        );

        const patientName = `${body.user.nombre || 'Paciente'} ${body.user.apellido || ''}`.trim();
        const fallbackText = `Nueva solicitud de paciente Welli para ${body.provider.name}. Paciente: ${patientName}, Contacto: ${body.user.numero_telefono || 'No'}, Cupo: $${body.user.monto_maximo || '0'}.`;

        // Dispatch Email
        const info = await transporter.sendMail({
            from: `"Welli Benefits Reservas" <${GMAIL_USER}>`,
            to: body.providerEmail,
            subject: `[Welli] Nueva solicitud de cita: ${patientName} - ${body.provider.name}`,
            text: fallbackText,
            html: htmlBody,
            attachments: [{
                filename: 'welli-logo-white.png',
                path: path.join(process.cwd(), 'public', 'images', 'welli-logo-white.png'),
                cid: 'welli-logo' // mismo cid usado en el src del HTML
            }]
        });

        console.log('Email sent successfully: %s', info.messageId);

        // Async auditing without blocking response
        await logToGoogleSheets(body);

        return NextResponse.json({ success: true, messageId: info.messageId }, { status: 200 });

    } catch (error: any) {
        console.error('Error processing appointment request:', error);
        return NextResponse.json(
            { message: 'Failed to process request.', error: error.message },
            { status: 500 }
        );
    }
}

