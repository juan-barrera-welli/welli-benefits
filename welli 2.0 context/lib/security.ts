import { z } from "zod"

// Server-side validation utilities

export function sanitizeInput(input: string): string {
    // Remove potentially dangerous characters
    return input
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, '')
        .trim()
}

export function validatePhoneNumber(phone: string): boolean {
    // Validate Colombian and Peruvian phone numbers
    const colombianRegex = /^\+?57[0-9]{10}$/
    const peruvianRegex = /^\+?51[0-9]{9}$/
    return colombianRegex.test(phone) || peruvianRegex.test(phone)
}

export function validateEmail(email: string): boolean {
    const emailSchema = z.string().email()
    return emailSchema.safeParse(email).success
}

export function validateAmount(amount: number, country: 'CO' | 'PE'): boolean {
    if (amount <= 0) return false

    // Set reasonable limits based on country
    const limits = {
        CO: { min: 1000000, max: 50000000 }, // 1M - 50M COP
        PE: { min: 1000, max: 50000 }         // 1K - 50K PEN
    }

    const { min, max } = limits[country]
    return amount >= min && amount <= max
}

// XSS protection helper
export function escapeHtml(unsafe: string): string {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
}
