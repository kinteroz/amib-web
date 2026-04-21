// Alpha Vantage helper — server-only.
// Free tier: 25 requests/day, 5/minute. We cache aggressively (6h) and
// pack the dashboard into a single overview endpoint that fans out in parallel.

const BASE = 'https://www.alphavantage.co/query';
const REVALIDATE_SECONDS = 60 * 60 * 6; // 6 hours

function key() {
  const k = process.env.ALPHA_VANTAGE_KEY;
  if (!k) throw new Error('ALPHA_VANTAGE_KEY is not set');
  return k;
}

async function avFetch(params: Record<string, string>, tag: string) {
  const url = new URL(BASE);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  url.searchParams.set('apikey', key());

  const res = await fetch(url.toString(), {
    next: { revalidate: REVALIDATE_SECONDS, tags: [tag] },
  });
  if (!res.ok) throw new Error(`Alpha Vantage ${res.status}`);
  const json = await res.json();

  // Alpha Vantage returns 200 with a "Note" or "Information" key when rate-limited.
  if (json?.Note || json?.Information) {
    throw new Error(`Alpha Vantage throttled: ${json.Note || json.Information}`);
  }
  return json;
}

export interface QuotePoint {
  date: string; // YYYY-MM-DD
  value: number;
}

export interface Quote {
  symbol: string;
  price: number;
  change: number;       // absolute
  changePercent: number; // %
  previousClose: number;
  series: QuotePoint[];  // most recent last
}

export interface FxQuote {
  pair: string;          // "USD/MXN"
  rate: number;
  change: number;
  changePercent: number;
  series: QuotePoint[];
}

function parseSeries(obj: Record<string, any>, valueKey: string): QuotePoint[] {
  return Object.entries(obj)
    .map(([date, row]: [string, any]) => ({
      date,
      value: parseFloat(row[valueKey]),
    }))
    .filter(p => Number.isFinite(p.value))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getEquityQuote(symbol: string): Promise<Quote> {
  const raw = await avFetch(
    { function: 'TIME_SERIES_DAILY', symbol, outputsize: 'compact' },
    `av:eq:${symbol}`
  );
  const series = parseSeries(raw['Time Series (Daily)'] || {}, '4. close').slice(-90);
  if (series.length < 2) throw new Error(`No series for ${symbol}`);

  const price = series[series.length - 1].value;
  const previousClose = series[series.length - 2].value;
  const change = price - previousClose;
  const changePercent = (change / previousClose) * 100;

  return { symbol, price, change, changePercent, previousClose, series };
}

export async function getFxDaily(from: string, to: string): Promise<FxQuote> {
  const raw = await avFetch(
    { function: 'FX_DAILY', from_symbol: from, to_symbol: to, outputsize: 'compact' },
    `av:fx:${from}${to}`
  );
  const series = parseSeries(raw['Time Series FX (Daily)'] || {}, '4. close').slice(-90);
  if (series.length < 2) throw new Error(`No FX series for ${from}/${to}`);

  const rate = series[series.length - 1].value;
  const prev = series[series.length - 2].value;
  const change = rate - prev;
  const changePercent = (change / prev) * 100;

  return { pair: `${from}/${to}`, rate, change, changePercent, series };
}

// Commodities — Alpha Vantage returns monthly by default; we request daily.
export async function getCommodity(fn: 'WTI' | 'BRENT' | 'SILVER'): Promise<Quote> {
  const raw = await avFetch({ 
    function: fn === 'SILVER' ? 'SILVER' : fn, 
    interval: 'daily' 
  }, `av:cm:${fn}`);
  
  const data = (raw?.data || [])
    .map((row: any) => ({ date: row.date, value: parseFloat(row.value) }))
    .filter((p: QuotePoint) => Number.isFinite(p.value))
    .sort((a: QuotePoint, b: QuotePoint) => a.date.localeCompare(b.date))
    .slice(-90);

  if (data.length < 2) throw new Error(`No commodity data for ${fn}`);
  const price = data[data.length - 1].value;
  const previousClose = data[data.length - 2].value;
  const change = price - previousClose;
  const changePercent = (change / previousClose) * 100;

  return { symbol: fn, price, change, changePercent, previousClose, series: data };
}

export interface NewsItem {
  title: string;
  url: string;
  time_published: string;
  summary: string;
  banner_image: string;
  source: string;
  overall_sentiment_score: number;
  overall_sentiment_label: string;
}

export async function getNewsSentiment(tickers?: string): Promise<NewsItem[]> {
  const params: Record<string, string> = { function: 'NEWS_SENTIMENT', sort: 'LATEST', limit: '10' };
  if (tickers) params.tickers = tickers;
  
  const raw = await avFetch(params, `av:news:${tickers || 'global'}`);
  return (raw.feed || []).map((item: any) => ({
    title: item.title,
    url: item.url,
    time_published: item.time_published,
    summary: item.summary,
    banner_image: item.banner_image,
    source: item.source,
    overall_sentiment_score: item.overall_sentiment_score,
    overall_sentiment_label: item.overall_sentiment_label,
  }));
}
