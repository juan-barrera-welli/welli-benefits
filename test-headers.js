const { google } = require('googleapis');
require('dotenv').config();

async function getHeaders() {
    try {
        const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n');
        const auth = new google.auth.GoogleAuth({
            credentials: { client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL, private_key: privateKey },
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });
        const sheets = google.sheets({ version: 'v4', auth });
        const res = await sheets.spreadsheets.values.get({ spreadsheetId: '1L3ZFb04tMDWuUt85Hf_vjoF-WX8zhADscbsY3r3v9sU', range: "'Usuarios welli benefits'!A1:M1" });
        console.log(res.data.values[0]);
    } catch (e) {
        console.error(e.message);
    }
}
getHeaders();
