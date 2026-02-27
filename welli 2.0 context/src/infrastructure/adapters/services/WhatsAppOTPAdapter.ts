import { IOTPService } from "@/src/core/ports/services/IOTPService"

export class WhatsAppOTPAdapter implements IOTPService {
    async sendOTP(phoneNumber: string): Promise<{ success: boolean; message?: string }> {
        // Mock implementation - in production, this would call WhatsApp Business API
        console.log(`[Mock] Sending OTP to ${phoneNumber}`)

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500))

        return {
            success: true,
            message: "OTP sent successfully"
        }
    }

    async verifyOTP(phoneNumber: string, code: string): Promise<{ success: boolean; message?: string }> {
        // Mock implementation - in production, this would verify against stored OTP
        console.log(`[Mock] Verifying OTP ${code} for ${phoneNumber}`)

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300))

        // Mock: accept any 4-digit code
        if (code.length === 4) {
            return {
                success: true,
                message: "OTP verified successfully"
            }
        }

        return {
            success: false,
            message: "Invalid OTP code"
        }
    }
}

// Singleton instance
export const whatsappOTPService = new WhatsAppOTPAdapter()
