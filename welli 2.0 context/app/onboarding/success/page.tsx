"use client"

import { useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Check, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/layout/navbar"
import { useFinancials } from "@/hooks/use-financials"
import { WHATSAPP_SUPPORT_URL } from "@/lib/constants"

export default function OnboardingSuccessPage() {
    const { country, format, config, isDruoEnabled } = useFinancials()
    const searchParams = useSearchParams()

    // Mocked data for display, in a real app this would come from the state/backend
    const amount = 300000
    const creditId = "#123456"
    const userEmail = "juan@welli.com.co"

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Navbar />

            <main className="flex-1 flex flex-col items-center pt-16 px-8 text-center space-y-10">
                <div className="flex flex-col items-center space-y-8">
                    {/* Success Icon */}
                    <div className="h-24 w-24 bg-[#D1FAE5] rounded-full flex items-center justify-center animate-in zoom-in duration-500">
                        <div className="h-16 w-16 bg-[#10B981] rounded-full flex items-center justify-center text-white shadow-sm">
                            <Check className="h-10 w-10 stroke-[3]" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground leading-tight px-4">
                            Identidad validada con éxito
                        </h1>

                        <div className="space-y-6 pt-4">
                            <p className="text-lg font-medium text-foreground leading-relaxed">
                                ¡Tu crédito {creditId} ha sido aprobado y firmado! 🎉
                                {isDruoEnabled && <span className="block text-green-600 font-bold mt-2">✨ Descuento DRUO del 10% aplicado ✨</span>}
                            </p>

                            <p className="text-lg font-medium text-foreground leading-relaxed">
                                El desembolso por {format(amount)} {config.CURRENCY} ha sido exitoso.
                            </p>

                            <div className="space-y-2 px-2">
                                <p className="text-[15px] text-foreground font-medium leading-relaxed">
                                    Hemos enviado una copia del contrato a <span className="inline-flex items-center align-middle mx-1 text-lg">📩</span>
                                    <span className="font-semibold text-foreground underline decoration-1 underline-offset-2">{userEmail}</span>.
                                    También puedes consultarlo en tu cuenta o descargarlo directamente aquí abajo. 👇
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full max-w-sm space-y-10 pt-4">
                    <p className="text-[15px] font-medium text-foreground">
                        ¿Tienes dudas? <a href={WHATSAPP_SUPPORT_URL} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline decoration-1 underline-offset-4 font-semibold">No dudes en contactarnos.</a>
                    </p>

                    <Button className="w-full bg-[#FFCE00] hover:bg-[#FFCE00]/90 text-black font-bold h-14 text-lg rounded-xl shadow-sm">
                        Ingresar a mi cuenta
                    </Button>
                </div>
            </main>
        </div>
    )
}
