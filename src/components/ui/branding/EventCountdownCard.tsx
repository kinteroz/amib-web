'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { Database } from '@/types/database.types';
import styles from '@/components/ui/animations/animations.module.css';

type Evento = Database['public']['Tables']['eventos']['Row'];

interface EventCountdownSliderProps {
  eventos: Evento[];
  activeIndex?: number; // Optional prop to control which event to show via scroll
}

export function EventCountdownCard({ eventos = [], activeIndex }: EventCountdownSliderProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Sync internal index with external prop if provided
  useEffect(() => {
    if (activeIndex !== undefined) {
      setInternalIndex(activeIndex);
    }
  }, [activeIndex]);

  // Auto-play interval ONLY if activeIndex is NOT provided (fallback mode)
  useEffect(() => {
    if (activeIndex !== undefined || eventos.length <= 1 || isHovered) return;
    const timer = setInterval(() => {
      setInternalIndex((prev) => (prev + 1) % eventos.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [eventos.length, isHovered, activeIndex]);

  const currentEvent = eventos[internalIndex];

  useEffect(() => {
    if (!currentEvent) return;
    const target = new Date(currentEvent.fecha_inicio).getTime();

    const tick = () => {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance < 0) return;

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [currentEvent]);

  if (!eventos || eventos.length === 0 || !currentEvent) return null;

  const backgroundImageUrl = currentEvent.imagen_url || 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2670&auto=format&fit=crop';

  return (
    <div 
      className={styles.eventCardContent}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ position: 'relative', width: '100%', height: '100%' }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentEvent.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${backgroundImageUrl})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            opacity: 0.4, mixBlendMode: 'luminosity', zIndex: 0
          }}
        />
      </AnimatePresence>

      {/* Gradient overlay — heavy on the left for text legibility */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to right, rgba(0,10,30,0.98) 0%, rgba(0,10,30,0.82) 45%, rgba(0,10,30,0.35) 75%, rgba(0,10,30,0.0) 100%)',
        zIndex: 1
      }} />

      {/* Top fade — dissolves from hero above */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '18%',
        background: 'linear-gradient(to bottom, var(--color-primary) 0%, transparent 100%)',
        zIndex: 2,
        pointerEvents: 'none'
      }} />

      {/* Bottom fade — cinematic dissolve into next section */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '30%',
        background: 'linear-gradient(to top, var(--color-primary) 0%, rgba(0,10,30,0.6) 60%, transparent 100%)',
        zIndex: 2,
        pointerEvents: 'none'
      }} />

      {/* Content — above fade overlays */}
      <div className={styles.eventCardInner} style={{ zIndex: 3 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${currentEvent.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {/* Badge */}
            <span style={{
              display: 'inline-block', marginBottom: '1rem',
              background: 'var(--color-secondary-container)', color: 'var(--color-primary)',
              padding: '0.3rem 0.8rem', borderRadius: '100px',
              fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em'
            }}>
              {currentEvent.es_destacado ? '⭐ Evento Destacado' : 'Próximo Evento'}
            </span>

            <h2 className={styles.eventCardTitle}>{currentEvent.titulo}</h2>

            <p style={{ fontSize: 'clamp(0.85rem, 2vw, 1.05rem)', opacity: 0.75, lineHeight: 1.6, marginBottom: '2rem' }}>
              {currentEvent.descripcion}
            </p>

            {/* Countdown */}
            <div className={styles.countdownRow}>
              {[
                { value: timeLeft.days, label: 'Días' },
                { value: timeLeft.hours, label: 'Horas' },
                { value: timeLeft.minutes, label: 'Mins' },
              ].map(({ value, label }) => (
                <div key={label} className={styles.countdownUnit}>
                  <div className={styles.countdownNumber}>{value}</div>
                  <div className={styles.countdownLabel}>{label}</div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className={styles.eventCardActions}>
              <Link
                href={`/eventos/${currentEvent.id}/registro`}
                style={{
                  background: 'var(--color-secondary-container)',
                  color: 'var(--color-primary)',
                  padding: '0.9rem 2rem',
                  borderRadius: '100px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {currentEvent.tipo_acceso === 'pago' ? 'Adquirir Boletos' :
                 currentEvent.tipo_acceso === 'invitacion' ? 'Solicitar Invitación' : 'Registrarse (Gratis)'}
              </Link>
              {currentEvent.ubicacion && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.75, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                  📍 {currentEvent.ubicacion}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slider Controls - Only visible if not in scroll-control mode */}
      {activeIndex === undefined && eventos.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: '2rem',
          right: '3rem',
          zIndex: 10,
          display: 'flex',
          gap: '0.8rem',
          alignItems: 'center'
        }}>
          {eventos.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setInternalIndex(idx)}
              style={{
                width: internalIndex === idx ? '30px' : '8px',
                height: '8px',
                borderRadius: '10px',
                background: internalIndex === idx ? 'var(--color-secondary-container)' : 'rgba(255,255,255,0.3)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0
              }}
              aria-label={`Ir al evento ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
