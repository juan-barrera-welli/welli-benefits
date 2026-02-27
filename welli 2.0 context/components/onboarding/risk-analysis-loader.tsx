"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

const messages = [
    "Estamos analizando tu perfil...",
    "Conectando con centrales de riesgo...",
    "Calculando tu mejor oferta...",
    "Personalizando tu plan de pagos...",
    "Ya casi terminamos...",
]

export const RiskAnalysisLoader = () => {
    const [messageIndex, setMessageIndex] = useState(0)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        // Cycle through messages
        const messageInterval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % messages.length)
        }, 2000)

        // Simulate progress increment
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 95) return prev // Stop at 95 until redirected
                return prev + Math.random() * 5
            })
        }, 300)

        return () => {
            clearInterval(messageInterval)
            clearInterval(progressInterval)
        }
    }, [])

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white">
            <div className="w-full max-w-md px-8 flex flex-col items-center gap-8">
                {/* Visual Character / Logo */}
                <div className="relative group">
                    {/* Pulsing circles behind mascot */}
                    <div className="absolute inset-0 bg-[#FFC800]/20 rounded-full blur-3xl animate-pulse scale-150" />
                    <div className="absolute inset-0 bg-[#FFC800]/10 rounded-full blur-2xl animate-pulse scale-125 delay-700" />

                    <div className="relative w-48 h-48 animate-bounce transition-all duration-1000 ease-in-out">
                        <Image
                            src="/images/welli-loader-character.png"
                            alt="Welli Mascot Analyzing"
                            fill
                            style={{ objectFit: "contain" }}
                            className="drop-shadow-2xl"
                        />

                        {/* Scanning effect line */}
                        <div className="absolute inset-x-0 h-1 bg-[#FFC800] rounded-full shadow-[0_0_15px_#FFC800] animate-[scan_2s_ease-in-out_infinite] opacity-70" />
                    </div>
                </div>

                {/* Progress Indicator */}
                <div className="w-full space-y-4 text-center">
                    <div className="space-y-1.5 transition-all duration-500 animate-in fade-in slide-in-from-bottom-2">
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                            Solicitud en proceso
                        </h2>
                        <p className="text-sm text-muted-foreground font-medium h-5">
                            {messages[messageIndex]}
                        </p>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                        <div
                            className="h-full bg-[#FFC800] transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes scan {
                    0%, 100% { top: 10%; }
                    50% { top: 90%; }
                }
            `}</style>
        </div>
    )
}
