export interface IOTPService {
    sendOTP(phoneNumber: string): Promise<{ success: boolean, message?: string }>
    verifyOTP(phoneNumber: string, code: string): Promise<{ success: boolean, message?: string }>
}
