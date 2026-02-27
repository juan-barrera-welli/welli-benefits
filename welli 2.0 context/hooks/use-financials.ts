"use client"

import { useMemo, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { FINANCIAL_CONFIGS, getMonthlyRatio, formatCurrency, CountryCode } from "@/lib/financial"

export function useFinancials() {
    const searchParams = useSearchParams()

    const country = useMemo(() =>
        (searchParams.get("country") as CountryCode) || "CO",
        [searchParams])

    const isDruoEnabled = useMemo(() =>
        searchParams.get("druo") === "true" && country === "CO",
        [searchParams, country])

    const config = useMemo(() =>
        FINANCIAL_CONFIGS[country] || FINANCIAL_CONFIGS.CO,
        [country])

    const format = useCallback((val: number) =>
        formatCurrency(val, country),
        [country])

    const getRatio = useCallback((months: number) =>
        getMonthlyRatio(months, country, isDruoEnabled),
        [country, isDruoEnabled])

    return useMemo(() => ({
        country,
        config,
        format,
        getRatio,
        isDruoEnabled,
        currencySymbol: country === "CO" ? "$" : "S/",
    }), [country, config, format, getRatio, isDruoEnabled])
}
