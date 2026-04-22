'use client';

import React from 'react';
import { Database } from '@/types/database.types';
import styles from '../../animations/animations.module.css';

type Banner = Database['public']['Tables']['banners']['Row'];

interface HeroLayoutProps {
  banner: Banner;
  onVideoEnd?: () => void;
}

export function SplitHero({ banner, onVideoEnd }: HeroLayoutProps) {
  const stats = Array.isArray(banner.estadisticas_json) ? banner.estadisticas_json : [];

  return (
    <div style={{ 
      width: '100%', 
      height: '100vh', 
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      alignItems: 'center',
      background: 'var(--color-primary)'
    }}>
      {/* Left Column: Content */}
      <div style={{ padding: '0 10%', zIndex: 3, position: 'relative' }}>
        {banner.badge_texto && (
          <span style={{ 
            color: 'var(--color-secondary-container)', 
            fontWeight: 600, 
            letterSpacing: '0.3em', 
            fontSize: '0.75rem', 
            textTransform: 'uppercase', 
            marginBottom: '1.5rem',
            display: 'block'
          }}>
            {banner.badge_texto}
          </span>
        )}
        
        <h1 style={{ 
          fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', 
          lineHeight: 1.1, 
          fontWeight: 800,
          letterSpacing: '-0.04em',
          marginBottom: '1.5rem',
          color: 'white'
        }}>
          {banner.titulo}
        </h1>

        {banner.subtitulo && (
          <p style={{ 
            fontSize: '1.1rem', 
            color: 'rgba(255,255,255,0.7)', 
            maxWidth: '550px', 
            marginBottom: '2.5rem',
            lineHeight: 1.6
          }}>
            {banner.subtitulo}
          </p>
        )}

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '4rem' }}>
          {banner.cta_texto && (
            <a href={banner.cta_enlace || '#'} className={styles.premiumCard} style={{ 
              padding: '0.8rem 2rem', 
              borderRadius: '8px', 
              background: 'var(--color-secondary-container)', 
              color: 'var(--color-primary)',
              fontWeight: 700,
              fontSize: '0.95rem'
            }}>
              {banner.cta_texto}
            </a>
          )}
        </div>

        {/* Stats */}
        {stats.length > 0 && (
          <div style={{ display: 'flex', gap: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            {stats.map((stat: any, i: number) => (
              <div key={i}>
                <div style={{ 
                  fontSize: '1.8rem', 
                  fontWeight: 800, 
                  color: 'white'
                }}>
                  {stat.valor}
                </div>
                <div style={{ 
                  fontSize: '0.65rem', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.1em', 
                  opacity: 0.5,
                  marginTop: '0.25rem'
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Column: Media */}
      <div style={{ height: '100%', position: 'relative', overflow: 'hidden', zIndex: 1 }}>
        {banner.media_tipo === 'video' ? (
          <video 
            autoPlay 
            muted 
            onEnded={onVideoEnd}
            playsInline
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover'
            }}
          >
            <source src={banner.media_url || ''} type="video/mp4" />
          </video>
        ) : (
          <div style={{ 
            width: '100%', 
            height: '100%', 
            backgroundImage: `url(${banner.media_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }} />
        )}
        {/* Gradient Overlay for the split point */}
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          background: 'linear-gradient(to right, var(--color-primary), transparent 30%)',
          zIndex: 2
        }} />
      </div>
    </div>
  );
}
