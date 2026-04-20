'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import styles from '../animations/animations.module.css';

interface MarketData {
  label: string;
  value: string;
  trend: number;
  symbol: string;
}

export function MarketBar() {
  const [data, setData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Memoize client to prevent re-initialization on every render
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let isMounted = true;

    const fetchMarketData = async () => {
      try {
        const { data: indicators, error } = await supabase
          .from('market_indicators' as any)
          .select('*')
          .order('orden', { ascending: true });

        if (error) throw error;
        
        if (isMounted) {
          if (indicators && indicators.length > 0) {
            setData(indicators);
          } else {
            throw new Error("No data found");
          }
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching market data:", error);
        if (isMounted) {
          // Fallback Premium Mocks if DB fails or table is empty
          setData([
            { label: 'S&P/BMV IPC', symbol: '^MXX', value: '55,420.12', trend: 0.45 },
            { label: 'USD/MXN', symbol: 'USDMXN=X', value: '17.12', trend: -0.12 },
            { label: 'BIVA', symbol: 'BIVA.MX', value: '1,142.30', trend: 0.32 },
            { label: 'CETES 28d', symbol: 'CETES', value: '11.25%', trend: 0.00 },
          ]);
          setLoading(false);
        }
      }
    };

    fetchMarketData();

    const channel = supabase
      .channel('market-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'market_indicators' }, fetchMarketData)
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Don't render anything if we don't have data yet (or show skeletons)
  // But to avoid "skipping" or "lost" feeling, we ensure data exists
  if (data.length === 0 && !loading) return null;

  const renderItems = () => (
    data.map((item, index) => (
      <div key={`indicator-${index}`} className={styles.marketIndicator}>
        <span className={styles.indicatorLabel}>{item.label}</span>
        <div className={styles.indicatorValue}>
          {item.value}
          <span className={`${styles.indicatorTrend} ${item.trend >= 0 ? styles.trendUp : styles.trendDown}`}>
            {item.trend >= 0 ? '▲' : '▼'} {Math.abs(item.trend)}%
          </span>
        </div>
      </div>
    ))
  );

  return (
    <div className={styles.marketBarContainer}>
      <div className={styles.marketTicker}>
        {renderItems()}
        {renderItems()} {/* Double for infinite scroll effect */}
      </div>
    </div>
  );
}
