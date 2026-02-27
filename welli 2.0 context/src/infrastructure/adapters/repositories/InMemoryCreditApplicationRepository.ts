import { CreditApplication } from "@/src/core/domain/entities/CreditApplication"
import { ICreditApplicationRepository } from "@/src/core/ports/repositories/ICreditApplicationRepository"

export class InMemoryCreditApplicationRepository implements ICreditApplicationRepository {
    private applications: Map<string, CreditApplication> = new Map()

    async save(application: CreditApplication): Promise<void> {
        this.applications.set(application.id, application)
    }

    async findById(id: string): Promise<CreditApplication | null> {
        return this.applications.get(id) || null
    }

    async findByPhone(phoneNumber: string): Promise<CreditApplication[]> {
        return Array.from(this.applications.values()).filter(
            app => app.data.phone.fullNumber === phoneNumber
        )
    }
}

// Singleton instance
export const creditApplicationRepository = new InMemoryCreditApplicationRepository()
