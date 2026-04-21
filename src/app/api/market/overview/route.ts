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

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

async function safe<T>(fn: () => Promise<T>, label: string, warnings: string[]): Promise<T | null> {
  try {
    return await fn();
  } catch (e: any) {
    warnings.push(`${label}: ${e?.message || 'error'}`);
    return null;
  }
}

async function batchSequential<T>(
  tasks: Array<() => Promise<T>>,
  batchSize: number,
  pauseMs: number
): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(t => t()));
    results.push(...batchResults);
    if (i + batchSize < tasks.length) await delay(pauseMs);
  }
  return results;
}

export async function GET() {
  const warnings: string[] = [];

  // Alpha Vantage free tier: 5 req/min — run in batches of 4 with 13s pause
  const tasks: Array<() => Promise<any>> = [
    () => safe(() => getFxDaily('USD', 'MXN'), 'USD/MXN', warnings),
    ...PROXIES.map(p => () => safe(() => getEquityQuote(p.symbol), p.symbol, warnings)),
    ...MX_ADRS.map(a => () => safe(() => getEquityQuote(a.symbol), a.symbol, warnings)),
    () => safe(() => getCommodity('WTI'), 'WTI', warnings),
    () => safe(() => getCommodity('SILVER'), 'SILVER', warnings),
    () => safe(() => getNewsSentiment('EWW,AMX'), 'News', warnings),
  ];

  const all = await batchSequential(tasks, 4, 13_000);

  const [fx, ...rest] = all;
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
