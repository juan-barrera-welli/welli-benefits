// Adapter layer: Exposes OTP service to app actions
"use server"

import { whatsappOTPService } from "@/src/infrastructure/adapters/services/WhatsAppOTPAdapter"

export async function sendWhatsappOTP(phoneNumber: string) {
    return whatsappOTPService.sendOTP(phoneNumber)
}

export async function verifyWhatsappOTP(phoneNumber: string, code: string) {
    return whatsappOTPService.verifyOTP(phoneNumber, code)
}
