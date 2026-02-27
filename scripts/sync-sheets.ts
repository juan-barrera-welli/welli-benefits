import 'dotenv/config';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

// Define the structure of your provider
export interface Provider {
    id: string;
    type: string;
    name: string;
    category: string;
    specialty: string;
    procedures: string[];
    rating: number;
    reviews: number;
    locations: {
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
    }[];
    relatedProviderIds: string[];
    image: string;
    banner: string;
    featured: boolean;
    description?: string;
}

// Ensure the private key is properly formatted
const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');

const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = '1L3ZFb04tMDWuUt85Hf_vjoF-WX8zhADscbsY3r3v9sU';
const RANGE = 'A1:Z'; // Start at row 1 to read headers first

export async function fetchProvidersFromSheets(): Promise<Provider[]> {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            console.log('No data found.');
            return [];
        }

        // Skip the header row
        const headers = rows[0];
        const emailIndex = headers.findIndex((h: string) => h === 'provider_email');
        const imageIndex = headers.findIndex((h: string) => h === 'imagen_url');
        const bannerIndex = headers.findIndex((h: string) => h === 'banner_url');
        const dataRows = rows.slice(1);

        // Helper to format category ID
        const getCategoryId = (specialty: string) => {
            if (!specialty) return 'general-medicine';
            const normalized = specialty.toLowerCase().trim();
            if (normalized.includes('odontolog')) return 'dentistry';
            if (normalized.includes('visi') || normalized.includes('oftalmol')) return 'vision';
            if (normalized.includes('estética')) return 'esthetics';
            if (normalized.includes('plástica')) return 'plastic-surgery';
            if (normalized.includes('veterinar')) return 'veterinary';
            if (normalized.includes('ginecolog')) return 'gynecology';
            if (normalized.includes('psiquiatr') || normalized.includes('psicolog')) return 'psychiatry-psychology';
            if (normalized.includes('deporte')) return 'sports-medicine';
            return 'general-medicine'; // fallback
        }

        // Generate a URL-safe slug from the provider name for local images
        const slugify = (name: string): string => {
            return name
                .toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip accents
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
        };

        // Build a macro_sede → company base name map (first word = brand)
        const macroNameMap = new Map<string, string>();
        dataRows.forEach(row => {
            const macroSede = row[2] || '';
            if (macroSede && !macroNameMap.has(macroSede)) {
                const name = row[0] || '';
                // Use just the brand name (first word), e.g. "Sonría", "GAES", "Profamilia"
                const brandName = name.split(/[\s\-]/)[0].trim();
                macroNameMap.set(macroSede, brandName);
            }
        });

        // MAP ROWS TO INDIVIDUAL PROVIDER OBJECTS (1 row = 1 provider/branch)
        const providers: Provider[] = dataRows.map((row, index) => {
            const nombreComercial = row[0] || `provider-${index}`;
            const macroSede = row[2] || '';
            const categoriaName = row[1] || '';

            // Each row gets a unique ID using macro_sede + index
            const uniqueId = macroSede
                ? `sede-${macroSede}-${index}`
                : nombreComercial.toLowerCase().replace(/[^a-z0-9]/g, '-') + `-${index}`;

            const location = {
                name: nombreComercial,
                address: row[3] || '',
                department: row[7] || 'Bogotá D.C.',
                city: row[6] || 'Bogotá',
                country: 'CO',
                lat: 4.6097,
                lng: -74.0817,
                url: row[13] || '',
                agendaUrl: row[16] || '',
                featured: row[15]?.toLowerCase() === 'yes',
                providerEmail: emailIndex !== -1 ? (row[emailIndex] || '') : '',
            };

            // Use the macro company name for the image (shared across all branches)
            const imageBaseName = macroSede
                ? slugify(macroNameMap.get(macroSede) || nombreComercial)
                : slugify(nombreComercial);

            // Map external URLs if provided, fallback to local paths
            const externalImage = imageIndex !== -1 ? (row[imageIndex] || '').trim() : '';
            const externalBanner = bannerIndex !== -1 ? (row[bannerIndex] || '').trim() : '';

            return {
                id: uniqueId,
                type: 'clinic',
                name: nombreComercial,
                category: getCategoryId(categoriaName),
                specialty: categoriaName,
                procedures: row[9] ? row[9].split(',').map((p: string) => p.trim()) : [],
                rating: 5.0,
                reviews: 0,
                locations: [location],
                providerEmail: emailIndex !== -1 ? (row[emailIndex] || '') : '',
                relatedProviderIds: [],
                image: externalImage || `/images/providers/${imageBaseName}.jpg`,
                banner: externalBanner || `/images/providers/${imageBaseName}-banner.jpg`,
                featured: location.featured,
                description: row[12] || '',
            };
        }).filter(p => p.name && !p.name.includes('provider-'));

        return providers;
    } catch (error) {
        console.error('Error fetching data from Google Sheets:', error);
        return [];
    }
}

// Fetch Users
export async function fetchUsersFromSheets(): Promise<any[]> {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "'Usuarios welli benefits'!A1:Z",
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            console.log('No user data found.');
            return [];
        }

        const headers = rows[0];
        const dataRows = rows.slice(1);

        // Convert rows to objects using headers as keys
        const users = dataRows.map((row) => {
            const userObj: any = {};
            headers.forEach((header: string, index: number) => {
                userObj[header] = row[index] || '';
            });
            return userObj;
        });

        return users;
    } catch (error) {
        console.error('Error fetching users from Google Sheets:', error);
        return [];
    }
}

// Fetch Exclusive Benefits
export async function fetchBenefitsFromSheets(): Promise<any[]> {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "'beneficios_exclusivos'!A1:Z",
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            console.log('No benefits data found.');
            return [];
        }

        const headers = rows[0];
        const dataRows = rows.slice(1);

        // Generate a URL-safe slug from the provider name for local images
        const slugify = (name: string): string => {
            return name
                .toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip accents
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
        };

        // Convert rows to objects using headers as keys
        const benefits = dataRows.map((row) => {
            const benefitObj: any = {};
            headers.forEach((header: string, index: number) => {
                const key = header.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');
                benefitObj[key] = row[index] || '';
            });

            // If the user provided imagen_url or banner_url in sheets, prioritize them
            const externalImage = (benefitObj.imagen_url || benefitObj.image_url || '').trim();
            const externalBanner = (benefitObj.banner_url || '').trim();

            // Add automatic image paths based on brand name
            if (benefitObj.nombre_comercial) {
                const brandName = benefitObj.nombre_comercial.split(/[\s\-]/)[0].trim();
                const imageBaseName = slugify(brandName);
                benefitObj.image = externalImage || `/images/promotions/${imageBaseName}.jpg`;
                benefitObj.banner = externalBanner || `/images/promotions/${imageBaseName}-banner.jpg`;
            } else {
                benefitObj.image = externalImage || '';
                benefitObj.banner = externalBanner || '';
            }

            return benefitObj;
        });

        return benefits;
    } catch (error) {
        console.error('Error fetching benefits from Google Sheets:', error);
        return [];
    }
}

// Function to generate and save local JSON
async function syncProviders() {
    console.log('Fetching providers from Google Sheets...');
    const providers = await fetchProvidersFromSheets();

    const dataDirPath = path.join(process.cwd(), 'src', 'lib', 'data');
    if (!fs.existsSync(dataDirPath)) {
        fs.mkdirSync(dataDirPath, { recursive: true });
    }

    if (providers.length > 0) {
        const filePath = path.join(dataDirPath, 'providers.json');
        fs.writeFileSync(filePath, JSON.stringify(providers, null, 2));
        console.log(`Successfully synced ${providers.length} providers to ${filePath}`);
    } else {
        console.log('No providers synced.');
    }

    console.log('Fetching users from Google Sheets...');
    const users = await fetchUsersFromSheets();
    if (users.length > 0) {
        const usersFilePath = path.join(dataDirPath, 'users.json');
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
        console.log(`Successfully synced ${users.length} users to ${usersFilePath}`);
    } else {
        console.log('No users synced.');
    }

    console.log('Fetching benefits from Google Sheets...');
    const benefits = await fetchBenefitsFromSheets();
    if (benefits.length > 0) {
        const benefitsFilePath = path.join(dataDirPath, 'beneficios.json');
        fs.writeFileSync(benefitsFilePath, JSON.stringify(benefits, null, 2));
        console.log(`Successfully synced ${benefits.length} benefits to ${benefitsFilePath}`);
    } else {
        console.log('No benefits synced.');
    }
}

// Execute script
syncProviders();
