export const CATEGORIES = [
    { id: "ophthalmology", name: "Oftalmología", icon: "👁️" },
    { id: "dentistry", name: "Odontología", icon: "🦷" },
    { id: "plastic-surgery", name: "Cirugía plástica", icon: "👨‍⚕️" },
    { id: "otolaryngology", name: "Otorrinolaringología", icon: "👂" },
    { id: "protected-insurance", name: "Seguro Protegidos", icon: "🛡️" },
    { id: "head-neck-surgery", name: "Cirugía de Cabeza y Cuello", icon: "👤" },
    { id: "lab-exams", name: "Exámenes de Laboratorio", icon: "🧪" },
    { id: "physiotherapy", name: "Fisioterapia", icon: "🏃‍♂️" },
    { id: "speech-therapy", name: "Fonoaudiología", icon: "🗣️" },
    { id: "genetics", name: "Genética", icon: "🧬" },
    { id: "gynecology", name: "Ginecología", icon: "👩‍⚕️" },
    { id: "alternative-medicine", name: "Medicina Alternativa", icon: "🌿" },
    { id: "hair-medicine", name: "Medicina Capilar", icon: "💇‍♂️" },
    { id: "sports-medicine", name: "Medicina del Deporte", icon: "🏋️‍♂️" },
    { id: "general-medicine", name: "Medicina General", icon: "🩺" },
    { id: "regenerative-medicine", name: "Medicina Regenerativa", icon: "🌱" },
    { id: "nutrition", name: "Nutrición", icon: "🥗" },
    { id: "orthodontics", name: "Ortodoncia", icon: "😬" },
    { id: "orthopedics", name: "Ortopedia", icon: "🦴" },
    { id: "psychiatry-psychology", name: "Psiquiatría y Psicología", icon: "🧠" },
    { id: "radiology", name: "Radiologia", icon: "🩻" },
    { id: "veterinary", name: "Seguros Veterinarios", icon: "🐾" },
    { id: "sexology", name: "Sexología", icon: "🌶️" },
    { id: "urology", name: "Urología", icon: "💧" },
    { id: "fertility", name: "Fertilidad y Reproducción", icon: "👶" },
    { id: "bariatric-surgery", name: "Obesidad y Cirugía Bariátrica", icon: "⚖️" },
    { id: "dermatology", name: "Dermatología y Estética", icon: "🧴" },
    { id: "maxillofacial-surgery", name: "Cirugía Maxilofacial", icon: "💀" },
    { id: "allergology", name: "Alergologia", icon: "🤧" },
    { id: "coloproctology", name: "Coloproctologia", icon: "🍑" },
    { id: "gastroenterology", name: "Gastroenterología", icon: "🫄" },
    { id: "laboratory", name: "Laboratorio", icon: "🔬" },
    { id: "neurorehabilitation", name: "Neurorehabilitacion", icon: "🧩" },
    { id: "vascular-medicine", name: "Medicina vascular", icon: "🩸" },
    { id: "cardiology", name: "Cardiologia", icon: "❤️" },
    { id: "esthetics", name: "Medicina Estética", icon: "💅" },
    { id: "biomedical-engineering", name: "Ingeniería Biomédica", icon: "🤖" },
    { id: "audiology", name: "Audiologia", icon: "🦻" },
    { id: "endoscopy", name: "Endoscopia", icon: "🩺" },
    { id: "general-surgery", name: "Cirugía General", icon: "🧑‍⚕️" },
]

export const DEPARTMENTS = {
    CO: ["Bogotá", "Antioquia", "Valle del Cauca", "Atlántico"],
    PE: ["Lima", "Arequipa", "Cusco", "La Libertad"]
}

export const PROCEDURES = [
    { id: "limpieza-dental", name: "Limpieza Dental", category: "dentistry" },
    { id: "resina", name: "Resina", category: "dentistry" },
    { id: "blanqueamiento", name: "Blanqueamiento", category: "dentistry" },
    { id: "extracción", name: "Extracción", category: "dentistry" },
    { id: "endodoncia", name: "Endodoncia", category: "dentistry" },
    { id: "limpieza-facial", name: "Limpieza Facial", category: "esthetics" },
    { id: "botox", name: "Bótox", category: "esthetics" },
    { id: "acido-hialuronico", name: "Ácido Hialurónico", category: "esthetics" },
    { id: "consulta-fertilidad", name: "Consulta de Fertilidad", category: "fertility" },
    { id: "ecografia-pelvica", name: "Ecografía Pélvica", category: "fertility" },
    { id: "brackets", name: "Brackets Metálicos", category: "orthodontics" },
    { id: "invisible", name: "Ortodoncia Invisible", category: "orthodontics" },
    { id: "vacunacion", name: "Vacunación", category: "veterinary" },
    { id: "esterilizacion", name: "Esterilización", category: "veterinary" },
]

import providersData from "./data/providers.json"

export interface ProviderLocation {
    name?: string;
    address: string;
    department: string;
    city?: string;
    country: string;
    lat: number;
    lng: number;
    agendaUrl?: string;
    providerEmail?: string;
    featured?: boolean;
    originalId?: string; // ID of the specific sede
}

export interface ProviderData {
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
    providerEmail?: string;
}

// Genera un objeto consolidando las sedes por "Macro Sede"
const groupProviders = (data: any[]): ProviderData[] => {
    const macroMap = new Map<string, ProviderData>();

    data.forEach(provider => {
        // Tomamos la primera palabra del nombre como "Macro Name" para agrupar. Ej: "Sonría Av 68" -> "Sonría", "Dentix Norte" -> "Dentix"
        const macroName = provider.name.split(/[\s\-]/)[0].trim();
        const macroId = `macro-${macroName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

        if (!macroMap.has(macroId)) {
            // Inicializar la Macro Sede
            macroMap.set(macroId, {
                ...provider,
                id: macroId,
                name: macroName,
                // Reiniciamos procedures y locations para empezar a agregarlos de cada sede
                procedures: [...(provider.procedures || [])],
                locations: (provider.locations || []).map((loc: ProviderLocation) => ({ ...loc, originalId: provider.id }))
            });
        } else {
            // Añadir ubicaciones y procedimientos a la Macro Sede existente
            const macro = macroMap.get(macroId)!;

            // Añadir cada location de forma única si es posible, o simplemente adjuntarlas
            provider.locations?.forEach((loc: ProviderLocation) => {
                const isDuplicate = macro.locations.some(mLoc => mLoc.address === loc.address);
                if (!isDuplicate) macro.locations.push({ ...loc, originalId: provider.id });
            });

            // Combinar y deducir procedimientos únicos (Set)
            if (provider.procedures) {
                const allProcedures = new Set([...macro.procedures, ...provider.procedures]);
                macro.procedures = Array.from(allProcedures);
            }
        }
    });

    return Array.from(macroMap.values());
};

// Exportamos PROVIDERS ya agrupados (Macro Sedes)
export const PROVIDERS: ProviderData[] = groupProviders(providersData);

// Exportamos todas las sedes individuales
export const ALL_PROVIDERS: ProviderData[] = providersData as ProviderData[];

export const PROMOS = [
    {
        id: "p1",
        title: "2x1 en Limpieza Dental",
        providerName: "Clínica Dental Welli",
        description: "Aprovecha esta oferta exclusiva pagando con tu crédito Welli.",
        discount: "50% OFF",
        image: "/images/promo-dental.jpg",
        color: "#8C65C9"
    },
    {
        id: "p2",
        title: "Sesión de Spa Facial",
        providerName: "Centro Estético Renacer",
        description: "Regálate un momento de relax con un descuento especial.",
        discount: "30% OFF",
        image: "/images/promo-spa.jpg",
        color: "#4C7DFF"
    },
    {
        id: "p3",
        title: "Consulta Veterinaria",
        providerName: "Veterinaria Huellas",
        description: "Revisión general para tu mejor amigo a precio especial.",
        discount: "Gratis*",
        image: "/images/promo-vet.jpg",
        color: "#FFC800"
    }
]
