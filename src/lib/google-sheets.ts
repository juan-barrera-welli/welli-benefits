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
