"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Zap, Shield, CheckCircle2, Cloud, Landmark, Headphones } from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { ONBOARDING_ROUTES } from "@/lib/constants"
import { useFinancials } from "@/hooks/use-financials"

function DruoContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { country } = useFinancials()
    const [isConnecting, setIsConnecting] = useState(false)

    // Ensure this page is only accessible for Colombia
    if (country !== "CO") {
        router.push(`${ONBOARDING_ROUTES.SUCCESS}?${searchParams.toString()}`)
        return null
    }

    const handleConnect = async () => {
        setIsConnecting(true)
        // Simulation of DRUO connection process
        await new Promise(resolve => setTimeout(resolve, 2000))

        // After connection, redirect back to summary with druo=true
        const params = new URLSearchParams(searchParams.toString())
        params.set("druo", "true")
        router.push(`${ONBOARDING_ROUTES.SUMMARY}?${params.toString()}`)
    }

    const handleSkip = () => {
        router.push(`${ONBOARDING_ROUTES.SUCCESS}?${searchParams.toString()}`)
    }

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Navbar backHref={`${ONBOARDING_ROUTES.SUMMARY}?${searchParams.toString()}`} />

            <main className="flex-1 flex flex-col items-center px-6 pt-12 pb-12 max-w-lg mx-auto w-full">
                {/* Visual Header / Connection Diagram - Styled like screenshot */}
                <div className="w-full flex justify-center items-center mb-12">
                    <div className="relative h-20 w-20 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-md z-1 animate-in fade-in slide-in-from-left-4 duration-700">
                        <div className="h-12 w-12 bg-yellow-400 rounded-2xl flex items-center justify-center">
                            <Cloud className="h-8 w-8 text-black" />
                        </div>
                    </div>

                    <div className="w-16 h-0.5 border-t-4 border-dotted border-gray-200 -mx-1"></div>

                    <div className="relative h-28 w-28 bg-white rounded-full flex flex-col items-center justify-center border border-gray-100 shadow-lg z-10 animate-in fade-in zoom-in duration-700 delay-200">
                        <div className="w-5 h-5 rounded-md bg-[#00BCD4] mb-1"></div>
                        <span className="text-base font-black tracking-tighter text-gray-900">DRUO</span>
                    </div>

                    <div className="w-16 h-0.5 border-t-4 border-dotted border-gray-200 -mx-1"></div>

                    <div className="relative h-20 w-20 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-md z-1 animate-in fade-in slide-in-from-right-4 duration-700 delay-400">
                        <div className="h-12 w-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                            <Landmark className="h-8 w-8 text-gray-600" />
                        </div>
                    </div>
                </div>

                <div className="text-center space-y-4 mb-10">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 leading-tight">
                        Welli utiliza a DRUO para conectarse con tu cuenta bancaria
                    </h1>

                    {/* Discount Badge */}
                    <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl text-sm font-bold border border-green-100 animate-in fade-in zoom-in duration-500 delay-500">
                        <Zap className="h-4 w-4 fill-green-500" />
                        <span>¡Ahorra 10% en tu tasa de interés!</span>
                    </div>
                </div>

                <div className="w-full space-y-8 mb-12">
                    <div className="flex items-start gap-5 group">
                        <div className="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 border border-gray-100 group-hover:bg-blue-50 transition-colors">
                            <Zap className="h-6 w-6 text-gray-900 group-hover:text-blue-600" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-bold text-lg text-gray-900">Rápido y fácil</h3>
                            <p className="text-sm text-gray-500 font-medium">
                                Vincula tu cuenta de manera segura. Más de 10,000 bancos conectados.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-5 group">
                        <div className="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 border border-gray-100 group-hover:bg-green-50 transition-colors">
                            <Shield className="h-6 w-6 text-gray-900 group-hover:text-green-600" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-bold text-lg text-gray-900">Seguridad avanzada</h3>
                            <p className="text-sm text-gray-500 font-medium">
                                Encriptación bancaria de datos y protección anti-fraude de próxima generación.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-5 group">
                        <div className="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 border border-gray-100 group-hover:bg-purple-50 transition-colors">
                            <Headphones className="h-6 w-6 text-gray-900 group-hover:text-purple-600" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-bold text-lg text-gray-900">Siempre contigo</h3>
                            <p className="text-sm text-gray-500 font-medium">
                                Notificaciones en tiempo real y soporte personalizado cuando lo necesites.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Promotional Text Block - Explicitly mentions the ease and automated debits */}
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 mb-10 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-blue-100 rounded-full shrink-0">
                            <CheckCircle2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <p className="text-sm text-blue-900 font-medium leading-relaxed">
                            Al conectar tu cuenta no tendrás que preocuparte de nada. Haremos los débitos de manera <span className="text-blue-600 font-bold underline decoration-blue-200">automática</span> para que no tengas que entrar al portal ni gastar tiempo o entrar en mora. ¡Todo será súper simple y smooth!
                        </p>
                    </div>
                </div>

                <div className="w-full space-y-4 mt-auto">
                    <p className="text-[11px] text-center text-gray-400 max-w-[300px] mx-auto">
                        Al hacer clic en "Aceptar y continuar" aceptas los <span className="underline cursor-pointer">Términos del Servicio</span> y la <span className="underline cursor-pointer">Política de Privacidad</span> y nos autorizas a cobrar a tu cuenta según tu relación con Welli.
                    </p>

                    <Button
                        onClick={handleConnect}
                        disabled={isConnecting}
                        className="w-full h-16 bg-black hover:bg-black/90 text-white rounded-2xl text-lg font-bold shadow-lg"
                    >
                        {isConnecting ? "Conectando..." : "Aceptar y continuar"}
                    </Button>

                    <Button
                        onClick={handleSkip}
                        variant="ghost"
                        className="w-full h-12 text-gray-400 font-bold hover:text-gray-600"
                    >
                        Omitir por ahora
                    </Button>
                </div>
            </main>
        </div>
    )
}

export default function DruoConnectionPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Cargando...</div>}>
            <DruoContent />
        </Suspense>
    )
}
