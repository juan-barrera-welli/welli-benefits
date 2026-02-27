"use client"

import { useState, Suspense, useMemo } from "react"
import dynamic from "next/dynamic"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Info, Calendar, Briefcase, FileText, Zap } from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { ONBOARDING_ROUTES } from "@/lib/constants"
import { useFinancials } from "@/hooks/use-financials"

// Code splitting: Lazy load modals for better performance
const PaymentScheduleModal = dynamic(
    () => import("@/components/onboarding/payment-schedule-modal").then(mod => ({ default: mod.PaymentScheduleModal })),
    { ssr: false }
)
const WhatsappOtpModal = dynamic(
    () => import("@/components/onboarding/whatsapp-otp-modal").then(mod => ({ default: mod.WhatsappOtpModal })),
    { ssr: false }
)

function SummaryContent() {
    const searchParams = useSearchParams()
    const { country, format, config, getRatio, isDruoEnabled } = useFinancials()
    const amountParam = searchParams.get("amount") || (country === "CO" ? "25000000" : "25000")
    const monthsParam = searchParams.get("months") || "36"

    const amount = Number(amountParam)
    const months = Number(monthsParam)

    const [agreedPrepay, setAgreedPrepay] = useState(false)
    const [agreedDisbursement, setAgreedDisbursement] = useState(false)
    const [isScheduleOpen, setIsScheduleOpen] = useState(false)
    const [isOtpOpen, setIsOtpOpen] = useState(false)
    const router = useRouter()

    const { monthlyFee, totalToPay } = useMemo(() => {
        const fee = Math.round(amount * getRatio(months))
        const total = (fee + config.INSURANCE_MONTHLY) * months
        return { monthlyFee: fee, totalToPay: total }
    }, [amount, months, getRatio, config.INSURANCE_MONTHLY])

    const financialConditions = useMemo(() => [
        { label: "Monto del Préstamo", value: format(amount) },
        { label: `Garantía FGA (${(config.FGA_RATE * 100).toFixed(0)}%)`, value: format(amount * config.FGA_RATE), sub: "Financiado" },
        { label: "TEA (Tasa Fija Máxima)", value: `${((isDruoEnabled ? config.USURY_RATE_EA * 0.9 : config.USURY_RATE_EA) * 100).toFixed(2)}%`, highlight: isDruoEnabled },
        { label: "Interés Moratorio", value: country === "CO" ? "36.54%" : "45.12%", sub: "Solo atrasos" },
        { label: "Seguro Desgravamen", value: format(config.INSURANCE_MONTHLY), sub: "Mensual" },
    ], [country, format, amount, config.FGA_RATE, config.USURY_RATE_EA, config.INSURANCE_MONTHLY, isDruoEnabled])

    return (
        <div className="flex flex-col min-h-screen bg-gray-50/50">
            <Navbar backHref={`${ONBOARDING_ROUTES.CREDIT_OFFER}?country=${country}`} />

            <main className="flex-1 px-6 pt-6 pb-16 overflow-y-auto">
                <div className="max-w-lg mx-auto space-y-4">
                    {isDruoEnabled && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                                <Zap className="h-6 w-6 text-green-600 fill-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-green-800">¡Descuento DRUO aplicado! 🚀</p>
                                <p className="text-xs text-green-700">Tu tasa de interés ha sido reducida un 10% por conectar tu cuenta.</p>
                            </div>
                        </div>
                    )}
                    <div className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-6">
                        <div className="text-center space-y-2">
                            <h1 className="text-xl font-medium text-muted-foreground uppercase tracking-wider">
                                Tu cuota mensual será de
                            </h1>
                            <div className="flex items-baseline justify-center gap-2">
                                <span className="text-[2.5rem] font-bold tracking-tight text-foreground">
                                    {format(monthlyFee)}
                                </span>
                                <span className="text-lg font-medium text-muted-foreground">{config.CURRENCY}</span>
                            </div>

                            <div className="inline-flex items-center gap-2 bg-[#FFC800] text-black px-6 py-2 rounded-full font-bold shadow-sm">
                                <Calendar className="h-5 w-5" />
                                <span>{months} cuotas mensuales</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-foreground font-semibold">
                                <Briefcase className="h-5 w-5 text-primary" />
                                <h2 className="text-lg">Condiciones Financieras</h2>
                            </div>

                            <div className="bg-muted/30 rounded-xl p-6 border border-border/50">
                                <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center gap-2 font-semibold text-foreground">
                                        <span>TCEA</span>
                                        <Info className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <span className="text-2xl font-bold text-foreground">
                                        {((isDruoEnabled ? config.USURY_RATE_EA * 0.9 : config.USURY_RATE_EA) * 1.12 * 100).toFixed(2)}%
                                    </span>
                                </div>
                                <p className="text-[11px] text-muted-foreground font-medium">
                                    Incluye intereses, seguros y comisiones
                                </p>
                            </div>

                            <div className="space-y-4 px-1">
                                {financialConditions.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-start">
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                                            {item.sub && <p className="text-[10px] text-muted-foreground font-medium">{item.sub}</p>}
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm font-semibold ${item.highlight ? "text-green-600" : "text-foreground"}`}>{item.value}</p>
                                            {item.highlight && <p className="text-[10px] text-green-600 font-bold">DTO. DRUO APLICADO</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-primary/5 border border-primary/20 rounded-lg py-3 px-4 flex items-center justify-center gap-2 text-primary text-sm font-semibold">
                                <span>✨</span>
                                Sin comisiones ni gastos administrativos
                            </div>

                            <div className="border-t border-border pt-4 px-1">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-foreground">Total a Pagar</span>
                                    <span className="text-lg font-bold text-foreground">{format(totalToPay)}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsScheduleOpen(true)}
                                className="w-full bg-muted/50 rounded-xl py-4 flex items-center justify-center gap-2 text-sm font-bold text-muted-foreground hover:bg-muted transition-all border border-border/50"
                            >
                                <FileText className="h-4 w-4" />
                                VER CRONOGRAMA DETALLADO
                            </button>

                            <PaymentScheduleModal
                                isOpen={isScheduleOpen}
                                onClose={() => setIsScheduleOpen(false)}
                                amount={amount}
                                months={months}
                            />
                        </div>

                        <div className="border-t border-border pt-8 space-y-6">
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                Al aceptar, declaro estar de acuerdo con la <span className="font-semibold text-foreground underline cursor-pointer">Hoja Resumen</span> y los términos del contrato.
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Checkbox
                                        id="prepay"
                                        checked={agreedPrepay}
                                        onCheckedChange={(checked) => setAgreedPrepay(checked as boolean)}
                                        className="mt-1"
                                    />
                                    <label htmlFor="prepay" className="text-sm font-medium text-foreground leading-tight cursor-pointer">
                                        Estoy de acuerdo con el prepago y términos.
                                    </label>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Checkbox
                                        id="disbursement"
                                        checked={agreedDisbursement}
                                        onCheckedChange={(checked) => setAgreedDisbursement(checked as boolean)}
                                        className="mt-1"
                                    />
                                    <label htmlFor="disbursement" className="text-sm font-medium text-foreground leading-tight cursor-pointer">
                                        Acepto la condición de desembolso.
                                    </label>
                                </div>
                            </div>

                            <div className="pt-6 pb-4 space-y-3">
                                <Button
                                    disabled={!agreedPrepay || !agreedDisbursement}
                                    onClick={() => setIsOtpOpen(true)}
                                    className="w-full bg-[#FFC800] hover:bg-[#FFC800]/90 text-black font-bold shadow-sm h-12"
                                >
                                    Aplicar
                                </Button>
                                <Button
                                    onClick={() => router.push(`${ONBOARDING_ROUTES.CREDIT_OFFER}?country=${country}`)}
                                    variant="ghost"
                                    className="w-full text-muted-foreground font-medium"
                                >
                                    Volver a cambiar monto o cuotas
                                </Button>
                            </div>

                            {isOtpOpen && (
                                <WhatsappOtpModal
                                    phone="3103916755" // Mocked, should come from context/store
                                    title="Estas a punto de firmar el contrato, pagare, y tomar el crédito en firme"
                                    description="Ingresa el código de 4 dígitos que enviamos a tu Whatsapp para completar la firma y tomar el credito"
                                    buttonLabel="Validar y firmar"
                                    onSuccess={() => {
                                        if (country === "CO" && !isDruoEnabled) {
                                            router.push(`${ONBOARDING_ROUTES.DRUO_CONNECTION}?${searchParams.toString()}`)
                                        } else {
                                            router.push(`${ONBOARDING_ROUTES.SUCCESS}?${searchParams.toString()}`)
                                        }
                                    }}
                                    onClose={() => setIsOtpOpen(false)}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default function SummaryAndSignaturePage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Cargando resumen...</div>}>
            <SummaryContent />
        </Suspense>
    )
}
