import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getClientIp, checkRateLimitByIp, incrementRateLimit, clearRateLimit, isTrustedOrigin } from "@/lib/rate-limit";

// Mantenemos el bloqueo secundario por número de documento pero le damos prioridad al bloqueo absoluto por IP
const docRateLimits: Record<string, { attempts: number; blockedUntil: number | null }> = {};

export async function POST(req: NextRequest) {
    try {
        // Validación 1: Verificar el Origen para detener Postman, Curl o Bots de inmediato
        if (!isTrustedOrigin(req)) {
            return NextResponse.json({ error: "Permiso denegado. Origen desconocido o no autorizado." }, { status: 403 });
        }

        const ip = getClientIp(req);

        // Validación 2: Limite general por IP (Cualquier intento hacia cualquier cuenta cuenta)
        const ipLimitStatus = checkRateLimitByIp(ip);
        if (ipLimitStatus.blocked) {
            return NextResponse.json({
                error: `Tu red está temporalmente bloqueada por actividad inusual. Intenta de nuevo en ${ipLimitStatus.waitMinutes || 5} minutos.`,
                blocked: true
            }, { status: 429 });
        }

        const body = await req.json();
        const { documentNumber, password } = body;

        // Strip spaces safely in case users enter them
        const cleanDoc = documentNumber?.trim() || "";
        const cleanPass = password?.trim() || "";

        if (!cleanDoc || !cleanPass) {
            return NextResponse.json({ error: "El número de documento y la clave son obligatorios." }, { status: 400 });
        }

        const now = Date.now();
        const docLimit = docRateLimits[cleanDoc] || { attempts: 0, blockedUntil: null };

        // Check if the specific document is currently blocked
        if (docLimit.blockedUntil && docLimit.blockedUntil > now) {
            const timeLeftMs = docLimit.blockedUntil - now;
            const timeLeftMinutes = Math.ceil(timeLeftMs / 60000);
            return NextResponse.json({
                error: `Cuenta bloqueada temporalmente por seguridad. Intenta de nuevo en ${timeLeftMinutes} minutos.`,
                blocked: true
            }, { status: 429 });
        }

        if (docLimit.blockedUntil && docLimit.blockedUntil <= now) {
            docLimit.blockedUntil = null;
            docLimit.attempts = 0;
        }

        const usersFile = path.join(process.cwd(), 'src', 'lib', 'data', 'users.json');
        let users: any[] = [];
        if (fs.existsSync(usersFile)) {
            users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
        }

        const user = users.find((u: any) => u.numero_doc === cleanDoc && u.numero_doc !== "");

        if (user && user.contraseña === cleanPass) {
            // Success - Reset rate limits
            delete docRateLimits[cleanDoc];
            clearRateLimit(ip);
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
            // Failure - Increment BOTH document-specific and IP-wide trackers.
            docLimit.attempts += 1;
            const ipIncrementStatus = incrementRateLimit(ip);

            if (docLimit.attempts >= 3 || ipIncrementStatus.blocked) {
                // If either threshold hits, enforce blockage
                if (docLimit.attempts >= 3) {
                    docLimit.blockedUntil = now + (5 * 60 * 1000); // 5 minutes penalty
                    docRateLimits[cleanDoc] = docLimit;
                }

                return NextResponse.json({
                    error: "Has sido bloqueado por seguridad debido a múltiples intentos fallidos de validación. Espera unos minutos.",
                    blocked: true
                }, { status: 429 });
            } else {
                docRateLimits[cleanDoc] = docLimit;
                const remaining = Math.min(3 - docLimit.attempts, ipIncrementStatus.remaining ?? 0);
                return NextResponse.json({
                    error: `Credenciales inválidas. Te quedan ${remaining} ${remaining === 1 ? 'intento' : 'intentos'} antes de ser bloqueado temporalmente.`,
                    blocked: false
                }, { status: 401 });
            }
        }

    } catch (error) {
        console.error("Login API Error:", error);
        return NextResponse.json({ error: "Error interno del servidor. Inténtalo más tarde." }, { status: 500 });
    }
}
