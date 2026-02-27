import { CountryCode } from "../../domain/value-objects/Country"

export interface FinancialConfig {
    USURY_RATE_EA: number
    FGA_RATE: number
    INSURANCE_MONTHLY: number
    CURRENCY: string
    LOCALE: string
}

const FINANCIAL_CONFIGS: Record<CountryCode, FinancialConfig> = {
    CO: {
        USURY_RATE_EA: 0.4485,
        FGA_RATE: 0.10,
        INSURANCE_MONTHLY: 15000,
        CURRENCY: "COP",
        LOCALE: "es-CO",
    },
    PE: {
        USURY_RATE_EA: 0.9575,
        FGA_RATE: 0.05,
        INSURANCE_MONTHLY: 15,
        CURRENCY: "PEN",
        LOCALE: "es-PE",
    },
}

export class FinancialCalculationService {
    private formatters = new Map<string, Intl.NumberFormat>()

    getConfig(country: CountryCode): FinancialConfig {
        return FINANCIAL_CONFIGS[country] || FINANCIAL_CONFIGS.CO
    }

    calculateMonthlyRatio(months: number, country: CountryCode, applyDiscount: boolean = false): number {
        const config = this.getConfig(country)

        // Apply 10% discount to interest rate if requested (DRUO benefit)
        const effectiveUsuryRate = applyDiscount ? config.USURY_RATE_EA * 0.9 : config.USURY_RATE_EA

        // PMT Calculation Formula
        // monthlyRate = (1 + EA)^(1/12) - 1
        // Ratio = [monthlyRate * (1 + monthlyRate)^n] / [(1 + monthlyRate)^n - 1]

        const monthlyRate = Math.pow(1 + effectiveUsuryRate, 1 / 12) - 1
        const pmtRatio = (monthlyRate * Math.pow(1 + monthlyRate, months)) /
            (Math.pow(1 + monthlyRate, months) - 1)

        return pmtRatio
    }

    formatCurrency(value: number, country: CountryCode): string {
        const config = this.getConfig(country)
        const cacheKey = `${config.LOCALE}-${config.CURRENCY}`

        let formatter = this.formatters.get(cacheKey)
        if (!formatter) {
            formatter = new Intl.NumberFormat(config.LOCALE, {
                style: "currency",
                currency: config.CURRENCY,
                maximumFractionDigits: 0,
            })
            this.formatters.set(cacheKey, formatter)
        }

        return formatter.format(value).replace(config.CURRENCY, "").trim()
    }

    calculateMonthlyPayment(principal: number, months: number, country: CountryCode, applyDiscount: boolean = false): number {
        const ratio = this.calculateMonthlyRatio(months, country, applyDiscount)
        return Math.round(principal * ratio)
    }

    calculateTotalPayment(principal: number, months: number, country: CountryCode, applyDiscount: boolean = false): number {
        const monthlyFee = this.calculateMonthlyPayment(principal, months, country, applyDiscount)
        const config = this.getConfig(country)
        return (monthlyFee + config.INSURANCE_MONTHLY) * months
    }
}

// Singleton instance
export const financialService = new FinancialCalculationService()
