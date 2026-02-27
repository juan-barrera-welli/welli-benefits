"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface SplashScreenProps {
    finishLoading: () => void
}

export const SplashScreen = ({ finishLoading }: SplashScreenProps) => {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const timer = setTimeout(() => {
            finishLoading()
        }, 2500)

        return () => clearTimeout(timer)
    }, [finishLoading])

    return (
        <div
            className={cn(
                "fixed inset-0 z-[100] flex flex-col items-center justify-end bg-white transition-opacity duration-700 ease-in-out pb-0 overflow-hidden",
                mounted ? "opacity-100" : "opacity-0"
            )}
        >
            {/* Welli Logo */}
            <div className="absolute top-[25%] w-full flex justify-center animate-in fade-in zoom-in duration-1000">
                <img
                    src="/images/welli-brand-logo.png"
                    alt="Welli"
                    className="h-16 w-auto"
                />
            </div>

            {/* Text Message */}
            <div className="absolute top-[35%] w-full px-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                <p className="text-gray-900 font-medium text-lg leading-relaxed">
                    Bienvenido a Welli
                </p>
            </div>

            {/* Character Container */}
            <div className="relative w-full max-w-md flex justify-center translate-y-[10%] animate-rise-up">
                <div className="relative w-[300px] h-[300px]">
                    {/* Using the new character image */}
                    <img
                        src="/images/welli-loader-character.png"
                        alt="Welli Loading"
                        className="w-full h-full object-contain object-bottom animate-breathing-slow origin-bottom"
                    />
                </div>
            </div>
        </div>
    )
}
