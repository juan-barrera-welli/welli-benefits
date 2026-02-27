import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// In-memory rate limiting map: Record<numero_doc, { attempts: number; blockedUntil: number | null }>
// Not ideal for distributed serverless (like Vercel Edge), but works perfectly for a custom Node/Next dev setup.
const rateLimits: Record<string, { attempts: number; blockedUntil: number | null }> = {};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { documentNumber, password } = body;

        // Strip spaces safely in case users enter them
        const cleanDoc = documentNumber?.trim() || "";
        const cleanPass = password?.trim() || "";

        if (!cleanDoc || !cleanPass) {
            return NextResponse.json({ error: "El número de documento y la clave son obligatorios." }, { status: 400 });
        }

        const now = Date.now();
        const userLimit = rateLimits[cleanDoc] || { attempts: 0, blockedUntil: null };

        // Check if currently blocked
        if (userLimit.blockedUntil && userLimit.blockedUntil > now) {
            const timeLeftMs = userLimit.blockedUntil - now;
            const timeLeftMinutes = Math.ceil(timeLeftMs / 60000);
            return NextResponse.json({
                error: `Cuenta bloqueada por múltiples intentos fallidos. Por favor, intenta de nuevo en ${timeLeftMinutes} minutos.`,
                blocked: true
            }, { status: 429 });
        }

        // Unblock if time expired
        if (userLimit.blockedUntil && userLimit.blockedUntil <= now) {
            userLimit.blockedUntil = null;
            userLimit.attempts = 0;
        }

        // Read users database efficiently from the local generated file
        const usersFile = path.join(process.cwd(), 'src', 'lib', 'data', 'users.json');
        let users: any[] = [];
        if (fs.existsSync(usersFile)) {
            users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
        }

        // Find user by EXACT string comparison (ignoring case is usually not done for document numbers)
        const user = users.find(u => u.numero_doc === cleanDoc && u.numero_doc !== "");

        if (user && user.contraseña === cleanPass) {
            // Success - Reset rate limits
            delete rateLimits[cleanDoc];
            return NextResponse.json({
                success: true,
                user: {
                    nombre: user.nombre,
                    apellido: user.apellido,
                    tipo_doc: user.tipo_doc,
                    numero_doc: user.numero_doc,
                    correo_electronico: user.correo_electronico,
                    numero_telefono: user.numero_telefono,
                    wa_link: user.wa_link,
                    empresa: user.empresa,
                    monto_maximo: user.monto_maximo
                }
            });
        } else {
            // Failure - Increment attempts
            userLimit.attempts += 1;

            if (userLimit.attempts >= 3) {
                userLimit.blockedUntil = now + (5 * 60 * 1000); // 5 minutes penalty
                rateLimits[cleanDoc] = userLimit;
                return NextResponse.json({
                    error: "Has excedido el número máximo de intentos (3). Cuenta bloqueada por 5 minutos por seguridad.",
                    blocked: true
                }, { status: 429 });
            } else {
                rateLimits[cleanDoc] = userLimit;
                const remaining = 3 - userLimit.attempts;
                return NextResponse.json({
                    error: `Credenciales inválidas. Te quedan ${remaining} ${remaining === 1 ? 'intento' : 'intentos'} antes del bloqueo.`,
                    blocked: false
                }, { status: 401 });
            }
        }

    } catch (error) {
        console.error("Login API Error:", error);
        return NextResponse.json({ error: "Error interno del servidor. Inténtalo más tarde." }, { status: 500 });
    }
}
