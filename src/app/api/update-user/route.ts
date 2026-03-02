import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { google } from "googleapis";
import { isTrustedOrigin } from "@/lib/rate-limit";

// Use the same auth and ID setup as your sync-sheets or appendToSheet
const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');
const SPREADSHEET_ID = '1L3ZFb04tMDWuUt85Hf_vjoF-WX8zhADscbsY3r3v9sU';
const SHEET_NAME = 'Usuarios welli benefits';

export async function POST(req: NextRequest) {
    try {
        if (!isTrustedOrigin(req)) {
            return NextResponse.json({ error: "Permiso denegado. Origen desconocido." }, { status: 403 });
        }

        const body = await req.json();
        const { documentNumber, newEmail, newFoto } = body;

        if (!documentNumber) {
            return NextResponse.json({ error: "Faltan datos requeridos (documentNumber)." }, { status: 400 });
        }

        // 1. UPDATE LOCAL CACHE first so UI feels fast and relogins work instantly
        const usersFile = path.join(process.cwd(), 'src', 'lib', 'data', 'users.json');
        let users: Record<string, unknown>[] = [];
        if (fs.existsSync(usersFile)) {
            users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
            const userIndex = users.findIndex(u => u.numero_doc === documentNumber);
            if (userIndex !== -1) {
                if (newEmail !== undefined) users[userIndex].correo_electronico = newEmail;
                if (newFoto !== undefined) users[userIndex].foto = newFoto;
                fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
            }
        }

        // 2. UPDATE GOOGLE SHEETS IN BACKGROUND
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
                private_key: privateKey,
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        const sheets = google.sheets({ version: 'v4', auth });

        // Fetch just the column headers and the document numbers to find the right row quickly
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `'${SHEET_NAME}'!A1:Z`,
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            return NextResponse.json({ error: "Hoja de Sheets vacía." }, { status: 404 });
        }

        const headers: string[] = rows[0];
        const docPattern = ["numero_doc", "documento", "cedula", "numero document", "numero_documento"];
        const emailPattern = ["correo_electronico", "correo", "email"];
        const fotoPattern = ["foto_perfil", "foto", "fotoperfil", "profile_picture"];

        const docIndex = headers.findIndex(h => docPattern.includes(String(h).toLowerCase().trim()));
        const emailIndex = headers.findIndex(h => emailPattern.includes(String(h).toLowerCase().trim()));
        const fotoIndex = headers.findIndex(h => fotoPattern.includes(String(h).toLowerCase().trim()));

        if (docIndex === -1) {
            console.error("Columna documento requerida no encontrada:", headers);
            return NextResponse.json({ error: "Error de configuración de columnas en Sheets" }, { status: 500 });
        }

        // Find the user's row
        let targetRowIndex = -1;
        for (let i = 1; i < rows.length; i++) {
            if (rows[i][docIndex] === documentNumber) {
                targetRowIndex = i;
                break;
            }
        }

        if (targetRowIndex !== -1) {
            // Arrays are 0-indexed, but Sheets rows are 1-indexed. So row = targetRowIndex + 1
            const sheetRowNumber = targetRowIndex + 1;
            // Col Letter function
            const getColumnLetter = (colIndex: number) => {
                let temp = colIndex;
                let letter = '';
                while (temp >= 0) {
                    letter = String.fromCharCode((temp % 26) + 65) + letter;
                    temp = Math.floor(temp / 26) - 1;
                }
                return letter;
            };

            const updates: Promise<any>[] = [];

            if (newEmail !== undefined && emailIndex !== -1) {
                const colLetter = getColumnLetter(emailIndex);
                const updateRange = `'${SHEET_NAME}'!${colLetter}${sheetRowNumber}`;
                updates.push(sheets.spreadsheets.values.update({
                    spreadsheetId: SPREADSHEET_ID,
                    range: updateRange,
                    valueInputOption: 'USER_ENTERED',
                    requestBody: { values: [[newEmail]] }
                }));
            }

            if (newFoto !== undefined && fotoIndex !== -1) {
                const colLetter = getColumnLetter(fotoIndex);
                const updateRange = `'${SHEET_NAME}'!${colLetter}${sheetRowNumber}`;
                updates.push(sheets.spreadsheets.values.update({
                    spreadsheetId: SPREADSHEET_ID,
                    range: updateRange,
                    valueInputOption: 'USER_ENTERED',
                    requestBody: { values: [[newFoto]] }
                }));
            }

            await Promise.all(updates);

            return NextResponse.json({ success: true, message: "Correo actualizado en Local y Google Sheets" });
        } else {
            return NextResponse.json({ error: "Usuario no encontrado en el Sheets" }, { status: 404 });
        }

    } catch (error) {
        console.error("Error updates user info:", error);
        return NextResponse.json({ error: "Error en el servidor de actualización." }, { status: 500 });
    }
}
