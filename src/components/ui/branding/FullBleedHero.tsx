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
      
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        zIndex: 10, 
        padding: '80px 5% 0' // Added top padding to offset header
      }}>
        <span style={{ 
          color: accent || 'var(--color-secondary-container)', 
          fontWeight: 600, 
          letterSpacing: '0.3em', 
          fontSize: '0.85rem', 
          textTransform: 'uppercase', 
          marginBottom: '2.5rem' 
        }}>
          AMIB Institucional
        </span>
        <h1 style={{ 
          fontSize: 'clamp(3rem, 7vw, 6rem)', 
          lineHeight: 0.95, 
          maxWidth: '1200px',
          fontWeight: 800,
          letterSpacing: '-0.04em',
          marginBottom: '3rem',
          textAlign: 'center'
        }}>
          {title}
        </h1>
        <p style={{ 
          fontSize: '1.2rem', 
          opacity: 0.7, 
          maxWidth: '800px', 
          textAlign: 'center', 
          lineHeight: 1.6,
          marginBottom: '1rem'
        }}>
          {subtitle}
        </p>
        
        {children}
      </div>
    </div>
  );
}
