"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { sendWhatsappOTP, verifyWhatsappOTP } from "@/app/actions/auth"

interface WhatsappOtpModalProps {
    phone: string
    onSuccess: () => void
    onClose?: () => void
    title?: string
    description?: string
    buttonLabel?: string
}

export function WhatsappOtpModal({
    phone,
    onSuccess,
    onClose,
    title = "Ingresa el código de 4 dígitos",
    description = "Enviamos un código a tu Whatsapp",
    buttonLabel = "Validar y continuar"
}: WhatsappOtpModalProps) {
    const [otp, setOtp] = useState("")
    const [isVerifying, setIsVerifying] = useState(false)
    const [countdown, setCountdown] = useState(60)

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [countdown])

    const handleResend = async () => {
        if (countdown > 0) return
        setCountdown(60)
        await sendWhatsappOTP(phone)
    }

    async function handleVerify() {
        if (otp.length !== 4) return
        setIsVerifying(true)
        const result = await verifyWhatsappOTP(phone, otp)
        if (result.success) {
            onSuccess()
        } else {
            alert('Código inválido')
            setIsVerifying(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col items-center text-center space-y-6">
                <div className="h-12 w-12 bg-[#FFF9E5] rounded-full flex items-center justify-center mb-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#FFC800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 px-2 leading-tight">
                        {title}
                    </h2>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        {description}
                    </p>
                </div>

                <div className="py-2">
                    <InputOTP
                        maxLength={4}
                        value={otp}
                        onChange={(value) => setOtp(value)}
                    >
                        <InputOTPGroup className="gap-3">
                            {[0, 1, 2, 3].map((index) => (
                                <InputOTPSlot
                                    key={index}
                                    index={index}
                                    className="h-14 w-12 rounded-lg border-2 border-gray-200 text-2xl font-semibold shadow-sm focus:border-[#FFC800] focus:ring-0"
                                />
                            ))}
                        </InputOTPGroup>
                    </InputOTP>
                </div>

                <div className="text-sm">
                    <span className="text-gray-500">¿No lo recibiste? </span>
                    <button
                        onClick={handleResend}
                        disabled={countdown > 0}
                        className={`font-semibold underline decoration-gray-400 ${countdown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:text-black'}`}
                    >
                        {countdown > 0 ? `Re-enviar en ${countdown}s` : "Re-enviar."}
                    </button>
                </div>

                <Button
                    onClick={handleVerify}
                    disabled={otp.length !== 4 || isVerifying}
                    className="w-full bg-[#FFC800] hover:bg-[#FFC800]/90 text-black font-bold h-12 rounded-xl text-md shadow-sm"
                >
                    {isVerifying ? 'Verificando...' : buttonLabel}
                </Button>

                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-xs text-muted-foreground hover:text-foreground underline pt-2"
                    >
                        Cancelar
                    </button>
                )}
            </div>
        </div>
    )
}
