import { headers } from 'next/headers';
import { MarketDashboard, type OverviewPayload } from '@/components/ui/market/MarketDashboard';

export const revalidate = 21600;

async function getOverview(): Promise<OverviewPayload> {
  const h = await headers();
  const host = h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? 'http';
  const res = await fetch(`${proto}://${host}/api/market/overview`, {
    next: { revalidate: 21600 },
  });
  if (!res.ok) throw new Error('Market overview fetch failed');
  return res.json();
}

export default async function MarketPage() {
  const data = await getOverview();
  return <MarketDashboard data={data} />;
}
