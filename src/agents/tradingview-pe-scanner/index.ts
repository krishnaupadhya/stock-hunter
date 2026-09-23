import type { Agent } from '../../core/types.js';
import { log } from '../../core/logger.js';
import { writeRows } from '../../core/sheetsClient.js';
import { fetchTradingViewScan } from './fetch.js';
import { toRows } from './transform.js';

const NAME = 'tradingview-pe-scanner';

export const tradingviewPeScannerAgent: Agent = {
  name: NAME,

  async run() {
    log(NAME, 'Fetching scan results from TradingView...');
    const response = await fetchTradingViewScan();
    log(NAME, `Received ${response.data?.length ?? 0} rows.`);

    const rows = toRows(response);

    const spreadsheetId = process.env.SPREADSHEET_ID;
    if (!spreadsheetId) throw new Error('Missing SPREADSHEET_ID env var.');

    const sheetName = process.env.SHEET_NAME?.trim() || 'Sheet1';

    log(NAME, `Writing ${rows.length - 1} rows to spreadsheet ${spreadsheetId}...`);
    await writeRows(spreadsheetId, sheetName, rows);
    log(NAME, 'Done.');
  },
};
