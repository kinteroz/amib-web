import { NextResponse } from 'next/server';
import {
  getEquityQuote,
  getFxDaily,
  getCommodity,
  getNewsSentiment,
  type Quote,
  type FxQuote,
  type NewsItem,
} from '@/lib/market/alphaVantage';

export const dynamic = 'force-dynamic';
export const revalidate = 21600; // 6h

const MX_ADRS = [
  { symbol: 'AMX', name: 'América Móvil', sector: 'Telecom' },
  { symbol: 'FMX', name: 'FEMSA', sector: 'Consumo' },
  { symbol: 'KOF', name: 'Coca-Cola FEMSA', sector: 'Bebidas' },
  { symbol: 'CX', name: 'CEMEX', sector: 'Construcción' },
  { symbol: 'VIST', name: 'Vista Energy', sector: 'Energía' },
];

const PROXIES = [
  { symbol: 'EWW', name: 'iShares MSCI México', tag: 'proxy' },
  { symbol: 'SPY', name: 'S&P 500 (contexto US)', tag: 'context' },
];

export interface OverviewPayload {
  asOf: string;
  fx: FxQuote | null;
  proxies: Array<Quote & { name: string }>;
  adrs: Array<Quote & { name: string; sector: string }>;
  commodities: Array<Quote & { name: string }>;
  news: NewsItem[];
  warnings: string[];
}

async function safe<T>(fn: () => Promise<T>, label: string, warnings: string[]): Promise<T | null> {
  try {
    return await fn();
  } catch (e: any) {
    warnings.push(`${label}: ${e?.message || 'error'}`);
    return null;
  }
}

export async function GET() {
  const warnings: string[] = [];

  // Parallel fetch inclusive of new news and metals
  const [fx, ...rest] = await Promise.all([
    safe(() => getFxDaily('USD', 'MXN'), 'USD/MXN', warnings),
    ...PROXIES.map(p => safe(() => getEquityQuote(p.symbol), p.symbol, warnings)),
    ...MX_ADRS.map(a => safe(() => getEquityQuote(a.symbol), a.symbol, warnings)),
    safe(() => getCommodity('WTI'), 'WTI', warnings),
    safe(() => getCommodity('SILVER'), 'SILVER', warnings),
    safe(() => getNewsSentiment('EWW,AMX'), 'News', warnings),
  ]);

  const proxyQuotes = rest.slice(0, PROXIES.length) as (Quote | null)[];
  const adrQuotes = rest.slice(PROXIES.length, PROXIES.length + MX_ADRS.length) as (Quote | null)[];
  const wti = rest[PROXIES.length + MX_ADRS.length] as Quote | null;
  const silver = rest[PROXIES.length + MX_ADRS.length + 1] as Quote | null;
  const news = (rest[rest.length - 1] || []) as NewsItem[];

  const payload: OverviewPayload = {
    asOf: new Date().toISOString(),
    fx,
    proxies: PROXIES
      .map((p, i) => proxyQuotes[i] ? { ...proxyQuotes[i]!, name: p.name } : null)
      .filter(Boolean) as OverviewPayload['proxies'],
    adrs: MX_ADRS
      .map((a, i) => adrQuotes[i] ? { ...adrQuotes[i]!, name: a.name, sector: a.sector } : null)
      .filter(Boolean) as OverviewPayload['adrs'],
    commodities: [
      wti ? { ...wti, name: 'Petróleo WTI' } : null,
      silver ? { ...silver, name: 'Plata (XAG)' } : null,
    ].filter(Boolean) as OverviewPayload['commodities'],
    news,
    warnings,
  };

  return NextResponse.json(payload);
}
