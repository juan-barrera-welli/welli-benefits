"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useFinancials } from "@/hooks/use-financials"

interface PaymentScheduleModalProps {
    isOpen: boolean
    onClose: () => void
    amount: number
    months: number
}

export function PaymentScheduleModal({ isOpen, onClose, amount, months }: PaymentScheduleModalProps) {
    const { country, format, config, isDruoEnabled } = useFinancials()

    // Derived values using centralized config
    const fgaAmount = amount * config.FGA_RATE
    const totalPrincipal = amount + fgaAmount

    // Monthly rate logic: (1 + EA)^(1/12) - 1
    const effectiveUsuryRate = isDruoEnabled ? config.USURY_RATE_EA * 0.9 : config.USURY_RATE_EA
    const monthlyRate = Math.pow(1 + effectiveUsuryRate, 1 / 12) - 1

    // PMT Formula: P * [i(1+i)^n] / [(1+i)^n - 1]
    const pmt = (totalPrincipal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)

    // Generate Schedule
    const generateSchedule = () => {
        let remainingBalance = totalPrincipal
        const schedule = []

        for (let i = 1; i <= months; i++) {
            const interest = remainingBalance * monthlyRate
            const capital = pmt - interest
            remainingBalance -= capital

            schedule.push({
                index: i,
                date: new Date(new Date().setMonth(new Date().getMonth() + i)).toLocaleDateString(config.LOCALE, {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit"
                }),
                capital: Math.round(capital),
                interest: Math.round(interest),
                insurance: config.INSURANCE_MONTHLY,
                total: Math.round(pmt + config.INSURANCE_MONTHLY)
            })
        }
        return schedule
    }

    const schedule = generateSchedule()

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white border-none rounded-xl shadow-2xl">
                <div className="p-6 md:p-8 pb-4">
                    <DialogHeader className="flex flex-row items-center justify-between space-y-0">
                        <div className="space-y-1">
                            <DialogTitle className="text-xl md:text-2xl font-semibold tracking-tight text-foreground">
                                Cronograma de Pagos
                            </DialogTitle>
                            <p className="text-xs md:text-sm text-muted-foreground font-medium">
                                Detalle financiero de tu crédito Welli
                            </p>
                        </div>
                    </DialogHeader>
                </div>

                <div className="overflow-x-auto border-y border-border max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20">
                    <table className="w-full text-left border-collapse min-w-[500px] md:min-w-0">
                        <thead>
                            <tr className="bg-muted/50">
                                <th className="py-3 px-3 md:px-6 text-[10px] md:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">#</th>
                                <th className="py-3 px-2 md:px-4 text-[10px] md:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Fecha</th>
                                <th className="py-3 px-2 md:px-4 text-[10px] md:text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-right">Capital</th>
                                <th className="py-3 px-2 md:px-4 text-[10px] md:text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-right">Interés</th>
                                <th className="py-3 px-2 md:px-4 text-[10px] md:text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-right">Seguro</th>
                                <th className="py-3 px-3 md:px-6 text-[10px] md:text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {schedule.map((row) => (
                                <tr key={row.index} className="hover:bg-muted/30 transition-colors">
                                    <td className="py-3 px-3 md:px-6 text-[11px] md:text-xs font-medium text-muted-foreground">{row.index}</td>
                                    <td className="py-3 px-2 md:px-4 text-[11px] md:text-xs font-semibold text-foreground">{row.date}</td>
                                    <td className="py-3 px-2 md:px-4 text-[11px] md:text-xs font-medium text-foreground text-right">{format(row.capital)}</td>
                                    <td className="py-3 px-2 md:px-4 text-[11px] md:text-xs font-medium text-foreground text-right">{format(row.interest)}</td>
                                    <td className="py-3 px-2 md:px-4 text-[11px] md:text-xs font-medium text-muted-foreground text-right">{format(row.insurance)}</td>
                                    <td className="py-3 px-3 md:px-6 text-[11px] md:text-xs font-bold text-foreground text-right uppercase tracking-tight">{format(row.total)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 md:p-6 flex justify-end">
                    <Button
                        onClick={onClose}
                        className="w-full md:w-auto bg-[#FFC800] hover:bg-[#FFC800]/90 text-black font-bold px-8 h-12 md:h-10 text-lg md:text-sm shadow-sm"
                    >
                        Entendido
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
