import { CountryCode } from "../domain/value-objects/Country"
import { Money } from "../domain/value-objects/Money"
import { PhoneNumber } from "../domain/value-objects/PhoneNumber"

export interface CreditApplicationData {
    applicantName: string
    phone: PhoneNumber
    email: string
    documentType: string
    documentNumber: string
    monthlyIncome: string
    procedureType: string
    institutionName: string
    procedureCost: number
    requestedAmount: number
    requestedMonths: number
}

export class CreditApplication {
    private constructor(
        public readonly id: string,
        public readonly country: CountryCode,
        public readonly data: CreditApplicationData,
        public readonly status: 'pending' | 'approved' | 'rejected',
        public readonly createdAt: Date
    ) { }

    static create(country: CountryCode, data: CreditApplicationData): CreditApplication {
        return new CreditApplication(
            `APP-${Date.now()}`, // Simple ID generation
            country,
            data,
            'pending',
            new Date()
        )
    }

    approve(): CreditApplication {
        return new CreditApplication(
            this.id,
            this.country,
            this.data,
            'approved',
            this.createdAt
        )
    }

    reject(): CreditApplication {
        return new CreditApplication(
            this.id,
            this.country,
            this.data,
            'rejected',
            this.createdAt
        )
    }

    isPending(): boolean {
        return this.status === 'pending'
    }

    isApproved(): boolean {
        return this.status === 'approved'
    }
}
