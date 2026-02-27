// Type definitions for the Providers consumed by the application map and directory

export interface ProviderLocation {
    name?: string;
    address: string;
    department: string;
    city?: string;
    country: string;
    lat: number;
    lng: number;
    url?: string;
    agendaUrl?: string;
    providerEmail?: string;
    featured?: boolean;
}

export interface Provider {
    id: string;
    type: string;
    name: string;
    category: string;
    specialty: string;
    procedures: string[];
    rating: number;
    reviews: number;
    locations: ProviderLocation[];
    relatedProviderIds: string[];
    image: string;
    banner: string;
    featured: boolean;
    description?: string;
}
