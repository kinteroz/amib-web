'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database } from '@/types/database.types';
import { MarketMatrix } from '../MarketMatrix';
import { MarketPulse } from '../MarketPulse';
import styles from '../../animations/animations.module.css';
import { SplitHero } from './SplitHero';
import { FullscreenVideoHero } from './FullscreenVideoHero';
import { FullscreenImageHero } from './FullscreenImageHero';

type Banner = Database['public']['Tables']['banners']['Row'];

interface HeroCarouselProps {
  banners: Banner[];
}

export function HeroCarousel({ banners }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    if (!banners || banners.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners?.length]);

  // Randomize starting slide on mount
  useEffect(() => {
    if (banners && banners.length > 1) {
      setCurrentIndex(Math.floor(Math.random() * banners.length));
    }
  }, [banners?.length]);

  if (!banners || banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  useEffect(() => {
    if (isPaused || banners.length <= 1 || !currentBanner) return;

    const isVideo = currentBanner.media_tipo === 'video';
    if (isVideo) return;

    const bannerDur = currentBanner.duracion || 7;
    const interval = setInterval(nextSlide, bannerDur * 1000);
    return () => clearInterval(interval);
  }, [isPaused, banners.length, nextSlide, currentBanner?.media_tipo, currentBanner?.duracion]);

  const renderLayout = (banner: Banner) => {
    const layoutProps = { 
      banner, 
      onVideoEnd: banner.media_tipo === 'video' ? nextSlide : undefined 
    };

    switch (banner.tipo_hero) {
      case 'split':
        return <SplitHero {...layoutProps} />;
      case 'fullscreen-video':
        return <FullscreenVideoHero {...layoutProps} />;
      case 'fullscreen-image':
      default:
        return <FullscreenImageHero {...layoutProps} />;
    }
  };

  const renderEffect = (effect: string | null) => {
    const normalizedEffect = (effect || '').toLowerCase().trim();
    
    switch (normalizedEffect) {
      case 'matrix':
        return <MarketMatrix />;
      case 'pulse':
        return <MarketPulse />;
      case 'grain':
        return <div className={styles.grainOverlay} />;
      default:
        return null;
    }
  };

  return (
    <div 
      className={styles.spotlightWrapper} 
      style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
<AnimatePresence mode="wait">
        <motion.div
          key={currentBanner?.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{ position: 'absolute', inset: 0, zIndex: 1 }}
        >
          {/* Capa Base: Media (Imagen/Video) - zIndex 1 */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
            {renderLayout(currentBanner)}
          </div>

          {/* Capa Media: Efectos Visuales - zIndex 5000 */}
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            zIndex: 5000, 
            pointerEvents: 'none',
            width: '100%',
            height: '100%'
          }}>
            {renderEffect(currentBanner?.efecto_overlay)}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navegación (Dots) - Raised to avoid overlap with MarketBar */}
      {banners.length > 1 && (
        <div style={{ 
          position: 'absolute', 
          bottom: '120px', // Raised from 40px to 120px to stay above MarketBar (approx 80-100px height)
          left: '50%', 
          transform: 'translateX(-50%)', 
          zIndex: 100, // Very high z-index
          display: 'flex',
          gap: '12px',
          padding: '10px 20px',
          background: 'rgba(0,0,0,0.2)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setIsPaused(true); // Pause auto-advance if user manually navigates
              }}
              style={{
                width: index === currentIndex ? '32px' : '8px',
                height: '8px',
                borderRadius: '4px',
                backgroundColor: index === currentIndex ? 'var(--color-secondary-container)' : 'rgba(255,255,255,0.3)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              aria-label={`Ir al slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
