'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useMotionTemplate } from 'framer-motion';
import { LineChart, HorizontalBarChart } from './charts';
import { StatCard } from './StatCard';
import styles from './market.module.css';

interface QuotePoint { date: string; value: number; }

interface Quote {
  symbol: string;
  name?: string;
  sector?: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  series: QuotePoint[];
}

interface FxQuote {
  pair: string;
  rate: number;
  change: number;
  changePercent: number;
  series: QuotePoint[];
}

interface NewsItem {
  title: string;
  url: string;
  time_published: string;
  summary: string;
  banner_image: string;
  source: string;
  overall_sentiment_score: number;
  overall_sentiment_label: string;
}

export interface OverviewPayload {
  asOf: string;
  fx: FxQuote | null;
  proxies: Array<Quote & { name: string }>;
  adrs: Array<Quote & { name: string; sector: string }>;
  commodities: Array<Quote & { name: string }>;
  news: NewsItem[];
  warnings: string[];
}

function SectionHeader({ tag, title, desc }: { tag: string; title: string; desc?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={styles.sectionHeader}
    >
      <div>
        <div className={styles.sectionTag}>{tag}</div>
        <div className={styles.sectionTitle}>{title}</div>
        {desc && <div className={styles.sectionDesc}>{desc}</div>}
      </div>
    </motion.div>
  );
}

export function MarketDashboard({ data }: { data: OverviewPayload }) {
  const [activeTab, setActiveTab] = useState<'resumen' | 'divisas' | 'emisoras' | 'macro'>('resumen');
  const [showInfo, setShowInfo] = useState(false);
  const [showWarnings, setShowWarnings] = useState(false);

  // Spotlight: position: fixed so it ignores stacking contexts completely.
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);
  const spotlightBg = useMotionTemplate`radial-gradient(900px circle at ${mouseX}px ${mouseY}px, rgba(234,171,0,0.13), transparent 70%)`;

  useEffect(() => {
    const move = (e: MouseEvent) => { mouseX.set(e.clientX); mouseY.set(e.clientY); };
    const leave = () => { mouseX.set(-1000); mouseY.set(-1000); };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseleave', leave);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseleave', leave); };
  }, [mouseX, mouseY]);

  const { fx, proxies, adrs, commodities, news = [], warnings, asOf } = data;

  const [asOfStr, setAsOfStr] = useState('');
  useEffect(() => {
    setAsOfStr(new Date(asOf).toLocaleString('es-MX', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }));
  }, [asOf]);

  const getSentimentColor = (label: string) => {
    if (label.includes('Bullish')) return '#30D158';
    if (label.includes('Bearish')) return '#FF453A';
    return 'rgba(255,255,255,0.4)';
  };

  const tabs = [
    { id: 'resumen', label: 'Resumen' },
    { id: 'divisas', label: 'Divisas' },
    { id: 'emisoras', label: 'Emisoras' },
    { id: 'macro', label: 'Macro & Metales' },
  ] as const;

  return (
    <>
    <motion.div
      style={{
        position: 'fixed', inset: 0,
        pointerEvents: 'none', zIndex: 20,
        background: spotlightBg,
      }}
    />
    <div className={styles.page}>
      {/* Hero Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className={styles.heroEyebrow}>Portal Bursátil AMIB</div>
        <h1 className={styles.heroTitle}>Inteligencia de Mercado</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
          <div className={styles.asOf}>
            <span className={styles.livePulse} />
            Mercado Abierto · {asOfStr}
          </div>
          <button onClick={() => setShowInfo(!showInfo)} className={styles.methodologyToggle}>
            <span>{showInfo ? '✕ Cerrar' : 'ⓘ Metodología'}</span>
          </button>
        </div>

        <AnimatePresence>
          {showInfo && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className={styles.expandableContent}>
              <div className={styles.methodologyInner}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                  <div>
                    <h4>Análisis y Tecnología</h4>
                    <p>Integración de Alpha Vantage con análisis de sentimiento algorítmico y datos históricos de ADRs y divisas.</p>
                  </div>
                  <div>
                    <h4>Aviso Legal</h4>
                    <p>Datos con fines informativos. No constituye asesoría financiera. La AMIB se reserva el derecho de validación.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Navigation Tabs */}
      <div className={styles.tabContainer}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="activeTab" className={styles.tabIndicator} />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'resumen' && (
            <div className={styles.tabGrid}>
              <div className={styles.kpiStrip}>
                {proxies.map((p, i) => (
                  <StatCard
                    key={p.symbol}
                    label={p.name}
                    symbol={p.symbol}
                    value={p.price}
                    change={p.change}
                    changePercent={p.changePercent}
                    series={p.series}
                    valueFormatter={v => `$${v.toFixed(2)}`}
                    delay={i * 0.1}
                  />
                ))}
              </div>

              <SectionHeader tag="Market Insights" title="Lo que se dice de México" desc="Feed de noticias internacionales filtrado por el sentimiento del mercado global." />
              <div className={styles.newsGrid}>
                {news.slice(0, 3).map((item, i) => (
                  <div key={i} className={styles.newsCard}>
                    <div className={styles.newsMeta}>
                      <span style={{ fontSize: '0.6rem', opacity: 0.5 }}>{item.source}</span>
                      <span className={styles.sentimentBadge} style={{ background: getSentimentColor(item.overall_sentiment_label) + '22', color: getSentimentColor(item.overall_sentiment_label) }}>
                        {item.overall_sentiment_label}
                      </span>
                    </div>
                    <a href={item.url} target="_blank" rel="noreferrer" className={styles.newsTitle}>{item.title}</a>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {item.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'divisas' && (
            <div>
              <div className={styles.currencyRow}>
                {fx && (
                  <>
                    <div className={styles.compactStat}>
                      <div>
                        <div style={{ fontSize: '0.65rem', opacity: 0.5, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Dólar Interbancario</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>${fx.rate.toFixed(4)}</div>
                      </div>
                      <div style={{ textAlign: 'right', color: fx.change >= 0 ? '#30D158' : '#FF453A', fontWeight: 700 }}>
                        {fx.change >= 0 ? '▲' : '▼'} {fx.changePercent.toFixed(2)}%
                      </div>
                    </div>
                    <div style={{ gridColumn: 'span 2', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <LineChart points={fx.series} height={200} valueFormatter={v => `$${v.toFixed(3)}`} />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'emisoras' && (
            <div className={styles.adrGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {adrs.map((a, i) => (
                <div key={a.symbol} className={styles.adrCard} style={{ padding: '1.5rem', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ fontWeight: 800, color: 'var(--color-secondary-container)' }}>{a.symbol}</div>
                    <div style={{ fontSize: '0.65rem', opacity: 0.5, textTransform: 'uppercase' }}>{a.sector}</div>
                  </div>
                  <div style={{ fontSize: '0.9rem', marginBottom: '1.5rem', color: '#fff' }}>{a.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>${a.price.toFixed(2)}</div>
                    <div style={{ color: a.changePercent >= 0 ? '#30D158' : '#FF453A', fontSize: '0.8rem', fontWeight: 700 }}>
                      {a.changePercent >= 0 ? '▲' : '▼'} {Math.abs(a.changePercent).toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'macro' && (
            <div className={styles.kpiStrip}>
              {commodities.map((c, i) => (
                <StatCard
                  key={c.symbol}
                  label={c.name}
                  symbol={c.symbol}
                  value={c.price}
                  change={c.change}
                  changePercent={c.changePercent}
                  series={c.series}
                  valueFormatter={v => `$${v.toFixed(2)}`}
                  delay={i * 0.1}
                />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Footer Support Toggle */}
      <div className={styles.footerToggle}>
        <button className={styles.methodologyToggle} onClick={() => setShowWarnings(!showWarnings)}>
          {showWarnings ? '✕ Cerrar Estado de Red' : 'Ver Estado de Capa de Datos'}
        </button>
      </div>

      <AnimatePresence>
        {showWarnings && warnings.length > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={styles.warningBanner}>
            <strong>Logs de Sistema:</strong> {warnings.join(' · ')}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
}
