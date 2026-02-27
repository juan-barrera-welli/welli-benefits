"use client"

import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronRight, FileText, ScanLine } from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { ONBOARDING_ROUTES } from "@/lib/constants"

export default function OnboardingPage() {
    const searchParams = useSearchParams()
    const country = searchParams.get("country") || "CO"

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Standard Navbar */}
            <Navbar backHref="/" showMenu={true} />

            {/* Content Header */}
            <div className="relative px-6 pt-12 pb-6">
                <div className="flex justify-center mb-6">
                    <div className="relative h-40 w-40 animate-in fade-in zoom-in duration-700">
                        <Image
                            src="/images/welli-mascot-hi.png"
                            alt="Welli Mascot"
                            fill
                            style={{ objectFit: "contain" }}
                            priority
                        />
                    </div>
                </div>

                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                        ¿Cómo quieres continuar?
                    </h1>
                    <p className="text-sm text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
                        Elige la opción que prefieras para validar tu identidad de forma segura.
                    </p>
                </div>
            </div>

            {/* Options */}
            <div className="flex-1 px-6 space-y-4 flex flex-col justify-start pt-4 max-w-lg mx-auto w-full">
                {/* Option 1: Fast Track */}
                <Link href="#" className="block group">
                    <div className="border border-border rounded-xl p-6 flex items-center gap-4 hover:border-primary hover:bg-primary/5 hover:shadow-md transition-all duration-200 cursor-pointer bg-white">
                        <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                            <ScanLine className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg text-foreground">Welli Check</h3>
                            <p className="text-sm text-muted-foreground font-medium">Escanea tu cédula <span className="text-primary ml-1 font-bold">✦ Más rápido</span></p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors translate-x-0 group-hover:translate-x-1 duration-200" />
                    </div>
                </Link>

                {/* Option 2: Manual Form */}
                <Link
                    href={`${ONBOARDING_ROUTES.PERSONAL_DATA}?country=${country}`}
                    className="block group"
                >
                    <div className="border border-border rounded-xl p-6 flex items-center gap-4 hover:border-primary hover:bg-primary/5 hover:shadow-md transition-all duration-200 cursor-pointer bg-white">
                        <div className="h-12 w-12 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-orange-100 transition-colors">
                            <FileText className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg text-foreground">Llenar formulario</h3>
                            <p className="text-sm text-muted-foreground font-medium">Ingresa tus datos manualmente</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors translate-x-0 group-hover:translate-x-1 duration-200" />
                    </div>
                </Link>

                <div className="pt-4">
                    <Button
                        onClick={() => window.history.back()}
                        variant="ghost"
                        className="w-full text-muted-foreground font-medium mb-8"
                    >
                        Volver al inicio
                    </Button>
                </div>
            </div>

            {/* Yellow Wave Footer */}
            <div className="relative h-32 mt-auto w-full overflow-hidden">
                {/* Convex Curve */}
                <div className="absolute top-0 left-[-10%] right-[-10%] h-[200%] bg-[#FFC800] rounded-t-[100%] flex flex-col items-center justify-start pt-8">
                    <div className="flex flex-col items-center gap-1">
                        <div className="relative h-12 w-32 invert filter brightness-0">
                            <Image
                                src="/images/welli-brand-logo.png"
                                alt="Welli Logo"
                                fill
                                style={{ objectFit: "contain" }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
