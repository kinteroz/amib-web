'use client';

import React from 'react';
import { MarketMatrix } from './MarketMatrix';
import { MarketPulse } from './MarketPulse';
import styles from '../animations/animations.module.css';

interface FullBleedHeroProps {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
  accent?: string;
}

export function FullBleedHero({ title, subtitle, children, accent }: FullBleedHeroProps) {
  return (
    <div className={styles.fullBleedHero}>
      <MarketMatrix />
      <div className={styles.grainOverlay} />
      <MarketPulse />

      {/* Radial vignette to anchor text against the matrix canvas */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 6,
        background: 'radial-gradient(ellipse 70% 60% at 50% 55%, rgba(0,15,35,0.55) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        padding: '130px 5% 5rem',
        color: '#ffffff',
      }}>
        <span style={{
          color: accent || 'var(--color-secondary-container)',
          fontWeight: 700,
          letterSpacing: '0.35em',
          fontSize: '0.72rem',
          textTransform: 'uppercase',
          marginBottom: '2rem',
          opacity: 0.9,
        }}>
          AMIB Institucional
        </span>
        <h1 style={{
          fontSize: 'clamp(2.8rem, 6.5vw, 5.5rem)',
          lineHeight: 1.0,
          maxWidth: '1100px',
          fontWeight: 800,
          letterSpacing: '-0.04em',
          marginBottom: '2rem',
          textAlign: 'center',
          color: '#ffffff',
          textShadow: '0 2px 40px rgba(0,0,0,0.5)',
        }}>
          {title}
        </h1>
        <p style={{
          fontSize: '1.15rem',
          color: 'rgba(255,255,255,0.72)',
          maxWidth: '720px',
          textAlign: 'center',
          lineHeight: 1.65,
          marginBottom: '2rem',
        }}>
          {subtitle}
        </p>

        {children}
      </div>
    </div>
  );
}
