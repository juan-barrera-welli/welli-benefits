"use client"

import { useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Navbar } from "@/components/layout/navbar"
import { cn } from "@/lib/utils"
import { ONBOARDING_ROUTES } from "@/lib/constants"
import { useFinancials } from "@/hooks/use-financials"
import { FINANCIAL_CONFIGS } from "@/lib/financial"

export default function CreditOfferPage() {
    const router = useRouter()
    const { country, format, getRatio, config } = useFinancials()
    const [amount, setAmount] = useState(country === "CO" ? "25,000,000" : "25,000")
    const [selectedInstalment, setSelectedInstalment] = useState("36")

    const formatCurrencyInput = useCallback((value: string) => {
        const number = value.replace(/[^0-9]/g, "")
        if (!number) return ""
        return new Intl.NumberFormat("en-US").format(Number(number))
    }, [])

    const calculateMonthly = useCallback((months: number) => {
        const rawAmount = Number(amount.replace(/,/g, "")) || 0
        const ratio = getRatio(months)
        return format(Math.round(rawAmount * ratio))
    }, [amount, getRatio, format])

    const instalments = useMemo(() => [
        { months: 36, value: "36" },
        { months: 24, value: "24" },
        { months: 18, value: "18" },
        { months: 12, value: "12" },
    ], [])

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Navbar backHref={`${ONBOARDING_ROUTES.PROCEDURE_DETAILS}?country=${country}`} />

            <main className="flex-1 px-6 pt-8 pb-8">
                <div className="max-w-lg mx-auto space-y-8">
                    <div className="text-center space-y-2">
                        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                            ¡Felicidades, Juan Camilo!
                        </h1>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Tu crédito de salud ha sido aprobado. Ajusta el monto y las cuotas a tu medida.
                        </p>
                    </div>

                    <div className="relative group overflow-hidden rounded-xl">
                        <div className="relative aspect-[2.1/1] bg-[#1F1F1F] p-8 flex flex-col justify-center gap-1 shadow-xl overflow-hidden">
                            <div className="absolute top-[-5%] right-[-5%] w-[30%] h-[40%] bg-[#05D5BD] rounded-[0_0_0_100%] opacity-90" />
                            <div className="absolute bottom-[-8%] right-[-3%] w-24 h-24 bg-[#FFCE00] rounded-full opacity-90" />
                            <div className="absolute bottom-[-8%] left-[-3%] w-16 h-16 bg-[#4C7DFF] rounded-full opacity-80" />

                            <div className="relative z-10 space-y-1">
                                <p className="text-white/80 text-sm font-medium tracking-wide">Tu cupo disponible</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-white text-[2rem] font-bold tracking-tight">
                                        {country === "CO" ? "$25.000.000" : "S/25.000"}
                                    </span>
                                    <span className="text-white/80 text-lg font-medium">{config.CURRENCY}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none text-foreground">Ingresa el monto que deseas utilizar</label>
                            <div className="relative">
                                <Input
                                    value={amount}
                                    onChange={(e) => setAmount(formatCurrencyInput(e.target.value))}
                                    className="pr-16 text-lg font-semibold"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-medium text-muted-foreground text-sm">{config.CURRENCY}</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-medium leading-none text-foreground">Plazo del crédito</label>
                            <RadioGroup
                                value={selectedInstalment}
                                onValueChange={setSelectedInstalment}
                                className="space-y-3"
                            >
                                {instalments.map((item) => {
                                    const isSelected = selectedInstalment === item.value
                                    const monthly = calculateMonthly(item.months)

                                    return (
                                        <div
                                            key={item.value}
                                            className={cn(
                                                "relative border rounded-xl p-4 transition-all duration-200 cursor-pointer flex items-center gap-4",
                                                isSelected
                                                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                                                    : "border-border bg-white hover:border-primary/30"
                                            )}
                                            onClick={() => setSelectedInstalment(item.value)}
                                        >
                                            <RadioGroupItem
                                                value={item.value}
                                                id={`instalment-${item.value}`}
                                            />
                                            <div className="flex-1">
                                                <p className={cn(
                                                    "text-sm font-semibold",
                                                    isSelected ? "text-foreground" : "text-foreground"
                                                )}>
                                                    {item.months} Cuotas mensuales de {monthly}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </RadioGroup>
                        </div>

                        <div className="pt-4 space-y-4">
                            <Button
                                onClick={() => {
                                    const raw = amount.replace(/,/g, "")
                                    router.push(`${ONBOARDING_ROUTES.SUMMARY}?amount=${raw}&months=${selectedInstalment}&country=${country}`)
                                }}
                                className="w-full bg-[#FFCE00] hover:bg-[#FFCE00]/90 text-black font-bold shadow-sm"
                            >
                                Seleccionar monto
                            </Button>

                            <Button
                                onClick={() => router.push(`${ONBOARDING_ROUTES.PROCEDURE_DETAILS}?country=${country}`)}
                                variant="ghost"
                                className="w-full text-muted-foreground font-medium mb-12"
                            >
                                Volver a corregir mis datos
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
