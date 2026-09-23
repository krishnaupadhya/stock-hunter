const SCAN_URL =
  'https://scanner.tradingview.com/india/scan?label-product=popup-screener-stock';

// The exact filter/column payload from your working curl request.
const SCAN_PAYLOAD = {
  columns: [
    'ticker-view', 'close', 'type', 'typespecs', 'pricescale', 'minmov',
    'fractional', 'minmove2', 'currency', 'change', 'volume',
    'relative_volume_10d_calc', 'market_cap_basic', 'fundamental_currency_code',
    'price_earnings_ttm', 'earnings_per_share_diluted_ttm',
    'earnings_per_share_diluted_yoy_growth_ttm', 'dividends_yield_current',
    'sector.tr', 'market', 'sector', 'AnalystRating', 'AnalystRating.tr',
  ],
  filter: [
    { left: 'price_earnings_growth_ttm', operation: 'in_range', right: [1, 1.5] },
    { left: 'is_primary', operation: 'equal', right: true },
  ],
  ignore_unknown_fields: false,
  options: { lang: 'en' },
  range: [0, 200],
  sort: { sortBy: 'market_cap_basic', sortOrder: 'desc' },
  markets: ['india'],
  filter2: {
    operator: 'and',
    operands: [
      {
        operation: {
          operator: 'or',
          operands: [
            { operation: { operator: 'and', operands: [
              { expression: { left: 'type', operation: 'equal', right: 'stock' } },
              { expression: { left: 'typespecs', operation: 'has', right: ['common'] } },
            ] } },
            { operation: { operator: 'and', operands: [
              { expression: { left: 'type', operation: 'equal', right: 'stock' } },
              { expression: { left: 'typespecs', operation: 'has', right: ['preferred'] } },
            ] } },
            { operation: { operator: 'and', operands: [
              { expression: { left: 'type', operation: 'equal', right: 'dr' } },
            ] } },
            { operation: { operator: 'and', operands: [
              { expression: { left: 'type', operation: 'equal', right: 'fund' } },
              { expression: { left: 'typespecs', operation: 'has_none_of', right: ['etf', 'mutual'] } },
            ] } },
          ],
        },
      },
      { expression: { left: 'typespecs', operation: 'has_none_of', right: ['pre-ipo'] } },
    ],
  },
};

export interface TradingViewScanResponse {
  totalCount: number;
  data: Array<{ s: string; d: unknown[] }>;
}

export async function fetchTradingViewScan(): Promise<TradingViewScanResponse> {
  const res = await fetch(SCAN_URL, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'text/plain;charset=UTF-8',
      referer: 'https://www.tradingview.com/',
    },
    body: JSON.stringify(SCAN_PAYLOAD),
  });

  if (!res.ok) {
    throw new Error(`TradingView scan failed: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<TradingViewScanResponse>;
}
