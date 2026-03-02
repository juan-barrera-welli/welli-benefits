import { google } from 'googleapis';

export interface AuditRecord {
    row: (string | number)[];
    sheetName: string;
}

/**
 * Función singleton o instanciable para conectar con Google Sheets y anexar datos.
 */
export async function appendToSheet(records: AuditRecord[]) {
    const { GOOGLE_SHEETS_PRIVATE_KEY, GOOGLE_SHEETS_CLIENT_EMAIL } = process.env;

    if (!GOOGLE_SHEETS_PRIVATE_KEY || !GOOGLE_SHEETS_CLIENT_EMAIL) {
        throw new Error('Variables de entorno de Google Sheets faltantes.');
    }

    const privateKey = GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n');
    const clientEmail = GOOGLE_SHEETS_CLIENT_EMAIL;

    const auth = new google.auth.GoogleAuth({
        credentials: { client_email: clientEmail, private_key: privateKey },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    // Spreadsheet Maestro de Welli
    const SPREADSHEET_ID = '1L3ZFb04tMDWuUt85Hf_vjoF-WX8zhADscbsY3r3v9sU';

    for (const record of records) {
        try {
            await sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range: `'${record.sheetName}'!A:N`, // Fixed A:N to easily support timestamp
                valueInputOption: 'USER_ENTERED',
                insertDataOption: 'INSERT_ROWS',
                requestBody: { values: [record.row] },
            });
            console.log(`Successfully appended to ${record.sheetName}`);
        } catch (error: unknown) {
            const err = error as any;
            console.error(`Error appending to ${record.sheetName}:`, err?.response?.data || err?.message || error);
        }
    }
}

export interface UserRequestHistory {
    id: string;
    providerName: string;
    procedureOrPromo: string;
    category: string;
    timestamp: string;
    status: string; // Default to 'Enviada' / 'Procesando' since we don't have bi-directional status yet
    comments?: string;
}

/**
 * Retrieves the request history for a specific user from the 'traker_mensajes' sheet.
 */
export async function getUserRequests(numeroDoc: string, email: string): Promise<UserRequestHistory[]> {
    const { GOOGLE_SHEETS_PRIVATE_KEY, GOOGLE_SHEETS_CLIENT_EMAIL } = process.env;

    if (!GOOGLE_SHEETS_PRIVATE_KEY || !GOOGLE_SHEETS_CLIENT_EMAIL) {
        console.error('Variables de entorno de Google Sheets faltantes.');
        return [];
    }

    try {
        const privateKey = GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n');
        const auth = new google.auth.GoogleAuth({
            credentials: { client_email: GOOGLE_SHEETS_CLIENT_EMAIL, private_key: privateKey },
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const SPREADSHEET_ID = '1L3ZFb04tMDWuUt85Hf_vjoF-WX8zhADscbsY3r3v9sU';

        // Fetch everything from traker_mensajes
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `'traker_mensajes'!A:N`,
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            return [];
        }

        const history: UserRequestHistory[] = [];

        // Skip the header row (index 0)
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];

            // Map columns based on payload in route.ts
            // A: nombre
            // B: apellido
            // C: tipo_doc
            // D: numero_doc (index 3)
            // E: numero_telefono
            // F: correo_electronico (index 5)
            // G: empresa
            // H: nombre_comercial (index 7)
            // I: categoria (index 8)
            // J: macro_sede
            // K: procedimiento/promo descuento (index 10)
            // L: disponibilidad
            // M: comentarios
            // N: time_stamp (index 13)

            const rowDoc = row[3]?.toString().trim() || '';
            const rowEmail = row[5]?.toString().trim() || '';

            // Check if matches the user requesting (either by exact doc or exact email)
            // It needs to match at least one explicitly provided identifier
            const matchesDoc = numeroDoc && rowDoc === numeroDoc.trim();
            const matchesEmail = email && rowEmail.toLowerCase() === email.toLowerCase().trim();

            if (matchesDoc || matchesEmail) {
                history.push({
                    id: `req-${i}`,
                    providerName: row[7] || 'Desconocido',
                    category: row[8] || 'Cita médica',
                    procedureOrPromo: row[10] || 'Consulta General',
                    timestamp: row[13] || 'Desconocida',
                    status: 'Completada', // The spreadsheet log implies the request was sent successfully
                    comments: row[12] || '', // Col M is index 12
                });
            }
        }

        // Return reversed so newest are first
        return history.reverse();

    } catch (error) {
        console.error("Failed to fetch user requests from Sheets:", error);
        return [];
    }
}

/**
 * Autentica un usuario validando su cédula y contraseña contra "Usuarios welli benefits" en Google Sheets.
 * Retorna el objeto del usuario preparado para la sesión si es exitoso, o null si falla.
 */
export async function authenticateUser(documento: string, contrasena: string): Promise<any | null> {
    const { GOOGLE_SHEETS_PRIVATE_KEY, GOOGLE_SHEETS_CLIENT_EMAIL } = process.env;

    if (!GOOGLE_SHEETS_PRIVATE_KEY || !GOOGLE_SHEETS_CLIENT_EMAIL) {
        console.error('Variables de entorno de Google Sheets faltantes para autentiación.');
        return null; // Fail safe
    }

    try {
        const privateKey = GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n');
        const auth = new google.auth.GoogleAuth({
            credentials: { client_email: GOOGLE_SHEETS_CLIENT_EMAIL, private_key: privateKey },
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const SPREADSHEET_ID = '1L3ZFb04tMDWuUt85Hf_vjoF-WX8zhADscbsY3r3v9sU';

        // Fetching the user tab
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `'Usuarios welli benefits'!A:L`,
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) return null;

        // Skip header index 0
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];

            // Expected indices based on manual check:
            // 0: nombre, 1: apellido, 2: tipo_doc, 3: numero_doc, 4: numero_telefono, 
            // 5: correo_electronico, 6: empresa, 7: contraseña, 8: monto_maximo, 9: wa_link

            const rowDoc = row[3]?.toString().trim() || '';
            const rowPass = row[7]?.toString().trim() || '';

            if (rowDoc === documento && rowPass === contrasena) {
                // Return structured user payload
                return {
                    nombre: row[0]?.toString().trim() || '',
                    apellido: row[1]?.toString().trim() || '',
                    tipo_doc: row[2]?.toString().trim() || '',
                    numero_doc: row[3]?.toString().trim() || '',
                    numero_telefono: row[4]?.toString().trim() || '',
                    correo_electronico: row[5]?.toString().trim() || '',
                    empresa: row[6]?.toString().trim() || '',
                    // DO NOT leak row[7] (password)
                    monto_maximo: row[8]?.toString().trim() || '0',
                    wa_link: row[9]?.toString().trim() || ''
                };
            }
        }

        return null; // Invalid credentials case
    } catch (error) {
        console.error("Failed to authenticate user against Sheets:", error);
        return null;
    }
}
