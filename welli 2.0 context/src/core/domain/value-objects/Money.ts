export type CurrencyCode = "COP" | "PEN"

export class Money {
    constructor(
        public readonly amount: number,
        public readonly currency: CurrencyCode
    ) {
        if (amount < 0) {
            throw new Error("Money amount cannot be negative")
        }
    }

    add(other: Money): Money {
        if (this.currency !== other.currency) {
            throw new Error("Cannot add money with different currencies")
        }
        return new Money(this.amount + other.amount, this.currency)
    }

    multiply(factor: number): Money {
        return new Money(this.amount * factor, this.currency)
    }

    format(locale: string): string {
        const formatter = new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: this.currency,
            maximumFractionDigits: 0,
        })
        return formatter.format(this.amount).replace(this.currency, "").trim()
    }

    static fromCountry(amount: number, countryCode: string): Money {
        const currency: CurrencyCode = countryCode === 'CO' ? 'COP' : 'PEN'
        return new Money(amount, currency)
    }
}
