export type CountryCode = "CO" | "PE"

export class Country {
    private constructor(
        public readonly code: CountryCode,
        public readonly name: string,
        public readonly phonePrefix: string
    ) { }

    static fromPhonePrefix(prefix: string): Country {
        const normalized = prefix.replace('+', '')
        switch (normalized) {
            case '57':
                return new Country('CO', 'Colombia', '+57')
            case '51':
                return new Country('PE', 'Peru', '+51')
            default:
                return new Country('CO', 'Colombia', '+57')
        }
    }

    static fromCode(code: CountryCode): Country {
        switch (code) {
            case 'CO':
                return new Country('CO', 'Colombia', '+57')
            case 'PE':
                return new Country('PE', 'Peru', '+51')
        }
    }

    isColombia(): boolean {
        return this.code === 'CO'
    }

    isPeru(): boolean {
        return this.code === 'PE'
    }
}
