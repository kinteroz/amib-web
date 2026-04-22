'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Database } from '@/types/database.types';
import styles from '@/components/ui/animations/animations.module.css';
import { EventCountdownCard } from './EventCountdownCard';

type Evento = Database['public']['Tables']['eventos']['Row'];

interface ScrollDrivenEventsProps {
  eventos: Evento[];
}

export function ScrollDrivenEvents({ eventos }: ScrollDrivenEventsProps) {
  const spacerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [stickyMode, setStickyMode] = useState<'top' | 'fixed' | 'bottom'>('top');

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleScroll = useCallback(() => {
    if (!spacerRef.current || isMobile) return;

    const rect = spacerRef.current.getBoundingClientRect();
    const containerHeight = spacerRef.current.offsetHeight;
    const viewportHeight = window.innerHeight;
  const stickyTopOffset = 80; // header height only
    
    // 1. Determine Sticky Mode (Manual sticky implementation)
    if (rect.top > stickyTopOffset) {
      if (stickyMode !== 'top') setStickyMode('top');
    } else if (rect.bottom < viewportHeight) {
      if (stickyMode !== 'bottom') setStickyMode('bottom');
    } else {
      if (stickyMode !== 'fixed') setStickyMode('fixed');
    }

    // 2. Calculate Active Index based on scroll progress inside the spacer
    const scrolledIn = stickyTopOffset - rect.top;
    const scrollRange = containerHeight - (viewportHeight - stickyTopOffset);

    if (scrolledIn <= 0) {
      setActiveIndex(0);
    } else if (scrolledIn >= scrollRange) {
      setActiveIndex(eventos.length - 1);
    } else {
      const progress = scrolledIn / scrollRange;
      const index = Math.min(
        Math.floor(progress * eventos.length),
        eventos.length - 1
      );
      if (index !== activeIndex) {
        setActiveIndex(index);
      }
    }
  }, [isMobile, eventos.length, stickyMode, activeIndex]);

  useEffect(() => {
    if (!mounted || isMobile) return;
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mounted, isMobile, handleScroll]);

  // Desktop: 100vh per event for a spacious storytelling feel
  const spacerHeight = !mounted || isMobile ? 'auto' : `${eventos.length * 100}vh`;

  // Manual styles based on stickyMode
  const getStickyStyles = (): React.CSSProperties => {
    if (!mounted || isMobile) return { width: '100%', minHeight: '100svh' };

    switch (stickyMode) {
      case 'fixed':
        return {
          position: 'fixed',
          top: '80px',
          left: 0,
          right: 0,
          height: 'calc(100vh - 80px)',
          display: 'flex',
          alignItems: 'stretch', // stretch so card fills full height
          zIndex: 50,
        };
      case 'bottom':
        return {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 'calc(100vh - 80px)',
          display: 'flex',
          alignItems: 'stretch',
        };
      case 'top':
      default:
        return {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 'calc(100vh - 80px)',
          display: 'flex',
          alignItems: 'stretch',
        };
    }
  };

  return (
    <section
      ref={spacerRef}
      style={{
        position: 'relative',
        height: spacerHeight,
        width: '100%',
        marginBottom: isMobile ? '0' : '0', // no margin — let next section handle spacing
      }}
    >
      <div style={getStickyStyles()}>
        {/* Full-bleed fullscreen: height 100% propagates to EventCountdownCard */}
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <EventCountdownCard
            eventos={eventos}
            activeIndex={mounted && !isMobile ? activeIndex : undefined}
          />

          {/* Vertical progress dots — desktop only, fixed via CSS */}
          {mounted && !isMobile && eventos.length > 1 && (
            <div className={styles.scrollProgressIndicator}>
              {eventos.map((ev, i) => (
                <div
                  key={ev.id}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'flex-end' }}
                >
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      color: activeIndex === i
                        ? 'var(--color-secondary-container)'
                        : 'rgba(255,255,255,0.18)',
                      transition: 'color 0.4s ease',
                      textTransform: 'uppercase',
                      letterSpacing: '0.15em',
                    }}
                  >
                    Evento {i + 1}
                  </span>
                  <motion.div
                    animate={{
                      scale: activeIndex === i ? 1.6 : 1,
                      backgroundColor:
                        activeIndex === i
                          ? 'var(--color-secondary-container)'
                          : 'rgba(255,255,255,0.2)',
                    }}
                    transition={{ duration: 0.3 }}
                    style={{ width: '8px', height: '8px', borderRadius: '50%' }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
