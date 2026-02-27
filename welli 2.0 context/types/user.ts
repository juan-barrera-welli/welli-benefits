export interface LoanApplication {
    medicalInstitution?: string;
    procedureType?: string;
    amount?: number;
    beneficiary: 'self' | 'other';
}

export interface CreditOffer {
    approvedAmount: number;
    selectedAmount?: number;
    termMonths?: number;
}

export interface WelliUser {
    id: string;
    phoneNumber: string;
    country: 'CO' | 'PE';
    kycMethod: 'manual' | 'ocr';
    onboardingStep: 'auth' | 'kyc-selection' | 'scan-id' | 'basic-info' | 'financial-info' | 'loan-details' | 'scoring' | 'offer' | 'contract' | 'completed';

    // Basic Info
    fullName?: string;
    email?: string;
    alternatePhone?: string;

    // Identity & Financial
    birthDate?: string; // ISO date
    documentId?: string;
    monthlyIncome?: number;
    employmentStatus?: string;

    loanApplication?: LoanApplication;
    creditOffer?: CreditOffer;

    contractSigned: boolean;
    contractSignedAt?: string; // ISO timestamp
}
