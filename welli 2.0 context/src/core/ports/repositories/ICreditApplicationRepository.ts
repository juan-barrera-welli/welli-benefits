import { CreditApplication } from "../../domain/entities/CreditApplication"

export interface ICreditApplicationRepository {
    save(application: CreditApplication): Promise<void>
    findById(id: string): Promise<CreditApplication | null>
    findByPhone(phoneNumber: string): Promise<CreditApplication[]>
}
