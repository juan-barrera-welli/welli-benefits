// Adapter layer: Exposes core financial service to presentation/hooks layer
export { financialService } from "@/src/core/application/services/FinancialCalculationService"
export type { CountryCode } from "@/src/core/domain/value-objects/Country"
export type { FinancialConfig } from "@/src/core/application/services/FinancialCalculationService"

// Legacy compatibility exports
import { CountryCode } from "@/src/core/domain/value-objects/Country"
import { financialService } from "@/src/core/application/services/FinancialCalculationService"

export const FINANCIAL_CONFIGS = {
    CO: financialService.getConfig('CO'),
    PE: financialService.getConfig('PE'),
}

export const getMonthlyRatio = (months: number, country: CountryCode = "CO", applyDiscount: boolean = false): number => {
    return financialService.calculateMonthlyRatio(months, country, applyDiscount)
}

export const formatCurrency = (val: number, country: CountryCode = "CO"): string => {
    return financialService.formatCurrency(val, country)
}

// Backward compatibility
export const FINANCIAL_CONFIG = FINANCIAL_CONFIGS.CO
export const formatCOP = (val: number) => formatCurrency(val, "CO")
