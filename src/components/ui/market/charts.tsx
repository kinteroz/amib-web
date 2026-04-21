'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

export interface Point { date: string; value: number; }

function scale(points: Point[], width: number, height: number, padding = 8) {
  const values = points.map(p => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = (width - padding * 2) / Math.max(points.length - 1, 1);

  const xy = points.map((p, i) => ({
    x: padding + i * stepX,
    y: padding + (1 - (p.value - min) / range) * (height - padding * 2),
    ...p,
  }));
  return { xy, min, max };
}

function toPath(xy: { x: number; y: number }[]) {
  if (!xy.length) return '';
  return xy.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
}

// Smooth cardinal-ish curve using quadratic midpoints.
function toSmoothPath(xy: { x: number; y: number }[]) {
  if (xy.length < 2) return toPath(xy);
  let d = `M ${xy[0].x} ${xy[0].y}`;
  for (let i = 1; i < xy.length; i++) {
    const prev = xy[i - 1];
    const cur = xy[i];
    const midX = (prev.x + cur.x) / 2;
    d += ` Q ${prev.x} ${prev.y}, ${midX} ${(prev.y + cur.y) / 2}`;
  }
  d += ` T ${xy[xy.length - 1].x} ${xy[xy.length - 1].y}`;
  return d;
}

// -----------------------------------------------------------------------------
// Sparkline — compact trend line for KPI cards. No axes, no interaction.
// -----------------------------------------------------------------------------
export function Sparkline({
  points,
  color = 'var(--color-secondary-container)',
  width = 120,
  height = 36,
}: { points: Point[]; color?: string; width?: number; height?: number; }) {
  const { xy } = useMemo(() => scale(points, width, height, 2), [points, width, height]);
  const path = useMemo(() => toSmoothPath(xy), [xy]);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`spark-fill-${color.replace(/\W/g, '')}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={`${path} L ${xy[xy.length - 1]?.x ?? 0} ${height} L ${xy[0]?.x ?? 0} ${height} Z`}
        fill={`url(#spark-fill-${color.replace(/\W/g, '')})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      />
      <motion.path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
    </svg>
  );
}

// -----------------------------------------------------------------------------
// LineChart — full-size chart with hover crosshair + tooltip.
// -----------------------------------------------------------------------------
export function LineChart({
  points,
  height = 320,
  color = 'var(--color-secondary-container)',
  valueFormatter = (v: number) => v.toFixed(2),
  yTicks = 4,
}: {
  points: Point[];
  height?: number;
  color?: string;
  valueFormatter?: (v: number) => string;
  yTicks?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const [w, setW] = useState(800);

  const { xy, min, max } = useMemo(() => scale(points, w, height, 24), [points, w, height]);
  const path = useMemo(() => toSmoothPath(xy), [xy]);

  const ticks = useMemo(() => {
    const arr: { value: number; y: number }[] = [];
    for (let i = 0; i <= yTicks; i++) {
      const v = min + (i / yTicks) * (max - min);
      const y = 24 + (1 - (v - min) / (max - min || 1)) * (height - 48);
      arr.push({ value: v, y });
    }
    return arr;
  }, [min, max, height, yTicks]);

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * w;
    if (!xy.length) return;
    let closest = 0;
    let best = Infinity;
    xy.forEach((p, i) => {
      const d = Math.abs(p.x - x);
      if (d < best) { best = d; closest = i; }
    });
    setHover(closest);
  };

  const hovered = hover !== null ? xy[hover] : null;

  return (
    <div
      style={{ width: '100%', height }}
      ref={el => { if (el && el.clientWidth !== w) setW(el.clientWidth); }}
    >
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${w} ${height}`}
        preserveAspectRatio="none"
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
        style={{ display: 'block' }}
      >
        <defs>
          <linearGradient id="line-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* y-grid + labels */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={24} x2={w - 8} y1={t.y} y2={t.y} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 4" />
            <text x={8} y={t.y + 4} fill="rgba(255,255,255,0.5)" fontSize="10" fontFamily="ui-monospace, monospace">
              {valueFormatter(t.value)}
            </text>
          </g>
        ))}

        {/* Area */}
        <motion.path
          d={`${path} L ${xy[xy.length - 1]?.x ?? 0} ${height - 24} L ${xy[0]?.x ?? 0} ${height - 24} Z`}
          fill="url(#line-area)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />

        {/* Line */}
        <motion.path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />

        {/* Crosshair */}
        {hovered && (
          <g>
            <line x1={hovered.x} x2={hovered.x} y1={16} y2={height - 16} stroke="rgba(255,255,255,0.25)" strokeDasharray="3 3" />
            <circle cx={hovered.x} cy={hovered.y} r={5} fill={color} stroke="#fff" strokeWidth={1.5} />
          </g>
        )}
      </svg>

      {hovered && (
        <div
          style={{
            position: 'relative',
            marginTop: -height + (hovered.y as number) - 40,
            marginLeft: `calc(${(hovered.x / w) * 100}% - 60px)`,
            width: 120,
            padding: '6px 10px',
            background: 'rgba(0, 32, 72, 0.92)',
            border: '1px solid rgba(234, 171, 0, 0.4)',
            borderRadius: 6,
            pointerEvents: 'none',
            fontSize: '0.72rem',
            color: '#fff',
            fontFamily: 'ui-monospace, monospace',
            boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ opacity: 0.6 }}>{hovered.date}</div>
          <div style={{ fontWeight: 700, color: 'var(--color-secondary-container)' }}>
            {valueFormatter(hovered.value)}
          </div>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// BarChart — horizontal % comparison, sorted, with negative/positive colors.
// -----------------------------------------------------------------------------
export function HorizontalBarChart({
  items,
  height = 28,
}: {
  items: { label: string; value: number; sublabel?: string }[];
  height?: number;
}) {
  const max = Math.max(...items.map(i => Math.abs(i.value)), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
      {items.map((item, idx) => {
        const pct = (Math.abs(item.value) / max) * 50; // half-width each side
        const positive = item.value >= 0;
        return (
          <div key={item.label} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 80px', alignItems: 'center', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.95)' }}>{item.label}</div>
              {item.sublabel && (
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>{item.sublabel}</div>
              )}
            </div>
            <div style={{ position: 'relative', height, background: 'rgba(255,255,255,0.04)', borderRadius: 4 }}>
              <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.15)' }} />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, delay: idx * 0.05, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  [positive ? 'left' : 'right']: '50%',
                  top: 4,
                  bottom: 4,
                  background: positive
                    ? 'linear-gradient(90deg, rgba(48, 209, 88, 0.4), rgba(48, 209, 88, 0.9))'
                    : 'linear-gradient(270deg, rgba(255, 69, 58, 0.4), rgba(255, 69, 58, 0.9))',
                  borderRadius: 3,
                }}
              />
            </div>
            <div style={{
              fontFamily: 'ui-monospace, monospace',
              fontSize: '0.85rem',
              fontWeight: 700,
              textAlign: 'right',
              color: positive ? '#30D158' : '#FF453A',
            }}>
              {positive ? '+' : ''}{item.value.toFixed(2)}%
            </div>
          </div>
        );
      })}
    </div>
  );
}
