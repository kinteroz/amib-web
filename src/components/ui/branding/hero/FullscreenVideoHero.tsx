'use client';

import React from 'react';
import { Database } from '@/types/database.types';
import styles from '../../animations/animations.module.css';

type Banner = Database['public']['Tables']['banners']['Row'];

interface HeroLayoutProps {
  banner: Banner;
  onVideoEnd?: () => void;
}

export function FullscreenVideoHero({ banner, onVideoEnd }: HeroLayoutProps) {
  const stats = Array.isArray(banner.estadisticas_json) ? banner.estadisticas_json : [];

  return (
    <div style={{ 
      width: '100%', 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center',
      textAlign: 'center',
      padding: '0 5%',
      position: 'relative'
    }}>
      {/* Background Video */}
      {banner.media_url && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, overflow: 'hidden' }}>
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
            <source src={banner.media_url} type="video/mp4" />
          </video>
          {/* Overlay to darken video */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0, 5, 15, 0.4)' }} />
        </div>
      )}

      {/* Content */}
      <div style={{ maxWidth: '1000px', zIndex: 3, position: 'relative' }}>
        {banner.badge_texto && (
          <span style={{ 
            color: 'var(--color-secondary-container)', 
            fontWeight: 600, 
            letterSpacing: '0.3em', 
            fontSize: '0.8rem', 
            textTransform: 'uppercase', 
            marginBottom: '1.5rem',
            display: 'block'
          }}>
            {banner.badge_texto}
          </span>
        )}
        
        <h1 style={{ 
          fontSize: 'clamp(2.5rem, 6.5vw, 5rem)', 
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
            fontSize: 'clamp(1rem, 1.5vw, 1.25rem)', 
            color: 'rgba(255,255,255,0.8)', 
            maxWidth: '700px', 
            margin: '0 auto 2.5rem auto',
            lineHeight: 1.6
          }}>
            {banner.subtitulo}
          </p>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          {banner.cta_texto && (
            <a href={banner.cta_enlace || '#'} className={styles.premiumCard} style={{ 
              padding: '1rem 2.5rem', 
              borderRadius: '8px', 
              background: 'var(--color-secondary-container)', 
              color: 'var(--color-primary)',
              fontWeight: 700,
              fontSize: '1rem'
            }}>
              {banner.cta_texto}
            </a>
          )}
          {banner.cta_texto_2 && (
            <a href={banner.cta_enlace_2 || '#'} style={{ 
              padding: '1rem 2.5rem', 
              borderRadius: '8px', 
              background: 'rgba(255,255,255,0.1)', 
              color: 'white',
              fontWeight: 700,
              fontSize: '1rem',
              border: '1px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)'
            }}>
              {banner.cta_texto_2}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
