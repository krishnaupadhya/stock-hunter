import { google, sheets_v4 } from 'googleapis';
import { JWT } from 'google-auth-library';

/**
 * Builds an authenticated Sheets API client from a Service Account.
 * No OAuth consent screen, no refresh tokens to babysit — just a key pair.
 * The service account must be added as an Editor on the target sheet
 * (Share button in Google Sheets, using the client_email as the "person").
 */
function getSheetsClient(): sheets_v4.Sheets {
  const email = process.env.GOOGLE_CLIENT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!email || !rawKey) {
    throw new Error(
      'Missing GOOGLE_CLIENT_EMAIL or GOOGLE_PRIVATE_KEY env vars. ' +
        'See .env.example.'
    );
  }

  const auth = new JWT({
    email,
    // Env vars can't hold real newlines cleanly, so the key is stored with
    // literal "\n" sequences and unescaped here at runtime.
    key: rawKey.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

/**
 * Clears the worksheet, then writes a fresh 2D array of values starting at A1.
 */
export async function writeRows(
  spreadsheetId: string,
  sheetName: string,
  values: unknown[][]
): Promise<void> {
  const sheets = getSheetsClient();
  const quotedSheetName = `'${sheetName.replace(/'/g, "''")}'`;

  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: quotedSheetName,
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${quotedSheetName}!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values },
  });
}
