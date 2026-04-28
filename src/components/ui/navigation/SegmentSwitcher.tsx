'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Link, usePathname } from '@/i18n/routing';

const SEGMENTS = [
  { id: 'global', label: 'Global', path: '/' },
  { id: 'certificacion', label: 'Certificación', path: '/certificaciones' },
  { id: 'asociados', label: 'Asociados', path: '/asociados' },
  { id: 'educacion', label: 'Educación', path: '/educacion' },
];

interface SegmentSwitcherProps {
  isScrolled: boolean;
}

export function SegmentSwitcher({ isScrolled }: SegmentSwitcherProps) {
  const pathname = usePathname();

  // Simple logic to find current segment based on path
  const currentSegment = SEGMENTS.find(s => {
    if (s.path === '/') return pathname === '/' || pathname === '';
    return pathname.startsWith(s.path);
  })?.id || 'global';

  return (
    <div style={{
      background: isScrolled ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      padding: '4px',
      borderRadius: '100px',
      display: 'inline-flex',
      gap: '4px',
      border: isScrolled ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.1)',
      position: 'relative',
      alignItems: 'center'
    }}>
      {SEGMENTS.map((segment) => {
        const isActive = currentSegment === segment.id;

        return (
          <Link
            key={segment.id}
            href={segment.path as any}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '100px',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: isActive 
                ? (isScrolled ? 'white' : 'var(--color-primary)') 
                : (isScrolled ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.6)'),
              textDecoration: 'none',
              position: 'relative',
              transition: 'color 0.3s ease',
              zIndex: 2
            }}
          >
            {isActive && (
              <motion.div
                layoutId="segment-pill"
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: isScrolled ? 'var(--color-primary-container)' : 'var(--color-secondary-container)',
                  borderRadius: '100px',
                  zIndex: -1,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            {segment.label}
          </Link>
        );
      })}
    </div>
  );
}
