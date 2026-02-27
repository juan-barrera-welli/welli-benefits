export class PhoneNumber {
    constructor(
        public readonly countryPrefix: string,
        public readonly number: string
    ) {
        this.validate()
    }

    private validate(): void {
        if (!this.number || this.number.length < 10) {
            throw new Error("Phone number must be at least 10 digits")
        }
        if (!['+57', '+51'].includes(this.countryPrefix)) {
            throw new Error("Unsupported country prefix")
        }
    }

    get fullNumber(): string {
        return `${this.countryPrefix}${this.number}`
    }

    get countryCode(): string {
        return this.countryPrefix === '+57' ? 'CO' : 'PE'
    }

    static parse(prefix: string, number: string): PhoneNumber {
        return new PhoneNumber(prefix, number)
    }
}
