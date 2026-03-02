import { NextRequest, NextResponse } from 'next/server';
import { getUserRequests } from '@/lib/google-sheets';
import { isTrustedOrigin } from '@/lib/rate-limit';

export async function POST(req: Request) {
    try {
        // Bloquear bots o solicitudes de orígenes desconocidos (Postman, scripts)
        if (!isTrustedOrigin(req as unknown as NextRequest)) {
            return NextResponse.json(
                { message: 'Permiso denegado. Origen desconocido o no autorizado.' },
                { status: 403 }
            );
        }

        const body = await req.json();
        const { numeroDoc, email } = body;

        if (!numeroDoc && !email) {
            return NextResponse.json(
                { message: 'Se requiere número de documento o correo electrónico.' },
                { status: 400 }
            );
        }

        console.log(`[route-user-requests] Fetching history for Doc: ${numeroDoc}, Email: ${email}`);

        const history = await getUserRequests(numeroDoc, email);

        return NextResponse.json({ success: true, count: history.length, data: history }, { status: 200 });

    } catch (error: unknown) {
        const err = error as Error;
        console.error('Error fetching user requests:', err);
        return NextResponse.json(
            { message: 'Failed to fetch user requests.', error: err.message },
            { status: 500 }
        );
    }
}
