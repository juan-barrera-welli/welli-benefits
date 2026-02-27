import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rate limiting store (in-memory, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS = 10 // Max 10 requests per minute

function getRateLimitKey(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
    return `ratelimit:${ip}`
}

function checkRateLimit(key: string): boolean {
    const now = Date.now()
    const record = rateLimitStore.get(key)

    if (!record || now > record.resetTime) {
        rateLimitStore.set(key, {
            count: 1,
            resetTime: now + RATE_LIMIT_WINDOW_MS
        })
        return true
    }

    if (record.count >= MAX_REQUESTS) {
        return false
    }

    record.count++
    return true
}

export function middleware(request: NextRequest) {
    // Apply rate limiting to sensitive endpoints
    if (request.nextUrl.pathname.startsWith('/api/') ||
        request.nextUrl.pathname.includes('/auth')) {

        const key = getRateLimitKey(request)
        const allowed = checkRateLimit(key)

        if (!allowed) {
            return new NextResponse(
                JSON.stringify({ error: 'Too many requests' }),
                {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json',
                        'Retry-After': '60'
                    }
                }
            )
        }
    }

    // Add security headers to all responses
    const response = NextResponse.next()

    // Additional runtime security headers
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')

    return response
}

export const config = {
    matcher: [
        '/api/:path*',
        '/auth/:path*',
        '/onboarding/:path*',
    ],
}
