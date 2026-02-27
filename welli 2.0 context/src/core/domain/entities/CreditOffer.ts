import { CountryCode } from "../value-objects/Country"
import { Money } from "../value-objects/Money"

export class CreditOffer {
    constructor(
        public readonly principal: Money,
        public readonly months: number,
        public readonly monthlyPayment: Money,
        public readonly totalPayment: Money,
        public readonly interestRate: number,
        public readonly country: CountryCode
    ) { }

    static create(
        principal: number,
        months: number,
        monthlyPayment: number,
        totalPayment: number,
        interestRate: number,
        country: CountryCode
    ): CreditOffer {
        const currency = country === 'CO' ? 'COP' : 'PEN'
        return new CreditOffer(
            new Money(principal, currency),
            months,
            new Money(monthlyPayment, currency),
            new Money(totalPayment, currency),
            interestRate,
            country
        )
    }

    getMonthlyPaymentFormatted(locale: string): string {
        return this.monthlyPayment.format(locale)
    }

    getTotalPaymentFormatted(locale: string): string {
        return this.totalPayment.format(locale)
    }
}
