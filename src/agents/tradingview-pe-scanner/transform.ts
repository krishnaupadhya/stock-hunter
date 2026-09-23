import type { TradingViewScanResponse } from './fetch.js';

const HEADERS = [
  'Symbol',
  'Type',
  'Price',
  'Sector Code',
  'Analyst Rating Label',
  'Last Updated',
];
const PRICE_INDEX = 1;
const TYPE_INDEX = 2;
const SECTOR_CODE_INDEX = 20;
const ANALYST_RATING_LABEL_INDEX = 22;
const INCLUDED_RATINGS = new Set(['Strong buy', 'Buy']);

/**
 * Selects and formats the columns written to the worksheet.
 */
export function toRows(response: TradingViewScanResponse): unknown[][] {
  const lastUpdated = new Date().toISOString();
  const rows = (response.data ?? [])
    .filter((item) => INCLUDED_RATINGS.has(item.d[ANALYST_RATING_LABEL_INDEX] as string))
    .map((item) => [
      item.s.replace(/^[^:]+:/, ''),
      item.d[TYPE_INDEX],
      item.d[PRICE_INDEX],
      item.d[SECTOR_CODE_INDEX],
      item.d[ANALYST_RATING_LABEL_INDEX],
      lastUpdated,
    ]);

  return [HEADERS, ...rows];
}
