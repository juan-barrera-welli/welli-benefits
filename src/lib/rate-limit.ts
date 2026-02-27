import { NextRequest } from "next/server";

// Memoria rudimentaria en servidor Node (No compartida si usas Serverless puro multi-instancia, pero suficiente para B2C básico/Dev)
interface RateLimitInfo {
    attempts: number;
    blockedUntil: number | null;
}

const ipAccessLimits: Record<string, RateLimitInfo> = {};

export function getClientIp(req: NextRequest): string {
    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }
    // Fallback: algunos entornos usan x-real-ip
    const realIp = req.headers.get("x-real-ip");
    if (realIp) return realIp;
    return "0.0.0.0"; // Localhost proxy fallback
}

/**
 * Registra y valida un intento fallido para una IP. 
 * Bloquea por 5 minutos después de 5 intentos seguidos fallidos desde la misma red.
 */
export function checkRateLimitByIp(ip: string, maxAttempts = 5, penaltyMinutes = 5): { blocked: boolean, remaining: number, waitMinutes?: number } {
    const now = Date.now();
    const tracker = ipAccessLimits[ip] || { attempts: 0, blockedUntil: null };

    // Si está baneado, ver si el tiempo ya pasó
    if (tracker.blockedUntil) {
        if (now < tracker.blockedUntil) {
            return {
                blocked: true,
                remaining: 0,
                waitMinutes: Math.ceil((tracker.blockedUntil - now) / 60000)
            };
        } else {
            // El castigo expiró
            tracker.blockedUntil = null;
            tracker.attempts = 0;
        }
    }

    ipAccessLimits[ip] = tracker;
    return { blocked: false, remaining: maxAttempts - tracker.attempts };
}

export function incrementRateLimit(ip: string, maxAttempts = 5, penaltyMinutes = 5) {
    const now = Date.now();
    const tracker = ipAccessLimits[ip] || { attempts: 0, blockedUntil: null };

    tracker.attempts += 1;
    if (tracker.attempts >= maxAttempts) {
        tracker.blockedUntil = now + penaltyMinutes * 60 * 1000;
        ipAccessLimits[ip] = tracker;
        return { blocked: true, waitMinutes: penaltyMinutes };
    }

    ipAccessLimits[ip] = tracker;
    return { blocked: false, remaining: maxAttempts - tracker.attempts };
}

export function clearRateLimit(ip: string) {
    if (ipAccessLimits[ip]) {
        delete ipAccessLimits[ip];
    }
}

/**
 * Verifica si el llamado a la API proviene de un dominio confiable 
 * (Evita envíos por Postman, Scripts Python, o Sitios Terceros de Hackers)
 */
export function isTrustedOrigin(req: NextRequest): boolean {
    const origin = req.headers.get('origin');
    const referer = req.headers.get('referer');
    const host = req.headers.get('host');

    // Permitimos llamadas locales (desarrollo) y al dominio de despliegue oficial
    const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://tu-dominio-produccion.com', // Reemplazar por dominio real cuando exista
        `https://${host}`,
        `http://${host}`
    ];

    // Si tenemos origen, verificarlo
    if (origin) {
        return allowedOrigins.some(ao => origin.startsWith(ao));
    }

    // Si no tiene origen (postman, fetch puro), revisar referer como fallback
    if (referer) {
        return allowedOrigins.some(ao => referer.startsWith(ao));
    }

    // Si bloquear requests que no tengan ni origin ni referer (Típico de bots backend)
    // Para no romper Vercel o Next Server, permitimos llamadas sin cabeceras SI la app las hace por el server internamente, pero aquí bloqueamos.
    return false;
}
