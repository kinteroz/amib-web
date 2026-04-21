'use client';

import { motion } from 'framer-motion';
import { Sparkline, type Point } from './charts';
import styles from './market.module.css';

interface Props {
  label: string;
  symbol?: string;
  value: number;
  change: number;
  changePercent: number;
  series: Point[];
  valueFormatter?: (v: number) => string;
  delay?: number;
}

export function StatCard({
  label,
  symbol,
  value,
  change,
  changePercent,
  series,
  valueFormatter = v => v.toFixed(2),
  delay = 0,
}: Props) {
  const positive = changePercent >= 0;
  const color = positive ? '#30D158' : '#FF453A';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={styles.kpiCard}
    >
      <div className={styles.kpiLabel}>
        <span>{label}</span>
        {symbol && <span className={styles.kpiSymbol}>{symbol}</span>}
      </div>
      <div className={styles.kpiValue}>{valueFormatter(value)}</div>
      <div className={`${styles.kpiChange} ${positive ? styles.kpiUp : styles.kpiDown}`}>
        <span style={{ fontSize: '0.7rem' }}>{positive ? '▲' : '▼'}</span>
        <span>{positive ? '+' : ''}{change.toFixed(2)}</span>
        <span style={{ opacity: 0.6, fontSize: '0.75rem' }}>({positive ? '+' : ''}{changePercent.toFixed(2)}%)</span>
      </div>
      <div className={styles.kpiSparkline}>
        <Sparkline points={series} color={color} width={240} height={40} />
      </div>
    </motion.div>
  );
}
