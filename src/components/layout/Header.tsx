'use client';

import React, { useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Link, useRouter, usePathname } from '@/i18n/routing';
import { SegmentSwitcher } from '@/components/ui/navigation/SegmentSwitcher';

export function Header() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  const SEGMENTS = [
    { id: 'global', path: '/' },
    { id: 'asociados', path: '/asociados' },
    { id: 'instituciones', path: '/instituciones' },
  ];

  const currentSegment = SEGMENTS.find(s => {
    if (s.path === '/') return pathname === '/' || pathname === '';
    return pathname.startsWith(s.path);
  })?.id || 'global';

  // Track scroll to apply glassmorphism
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Functional search using URL params
      router.push(`/?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <motion.header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: isScrolled ? '0.75rem 2.5rem' : '1.25rem 2.5rem',
        background: isScrolled ? 'rgba(255, 255, 255, 0.85)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: isScrolled ? 'blur(20px)' : 'none',
        borderBottom: isScrolled ? '1px solid rgba(0, 0, 0, 0.05)' : 'none',
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        color: isScrolled ? 'var(--on-surface)' : 'var(--on-primary)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden'
      }}
    >
      {/* Left Column: Logo */}
      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <Link href="/" style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px', color: 'inherit' }}>
          <div style={{ width: 22, height: 22, borderRadius: 4, background: 'var(--color-secondary-container)' }} />
          AMIB
        </Link>
      </div>
      
      {/* Center Column: Segment Switcher */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <SegmentSwitcher isScrolled={isScrolled} />
      </div>

      {/* Right Column: Navigation & Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', justifyContent: 'flex-end' }}>
        <nav style={{ display: 'flex', gap: '1.25rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {currentSegment === 'asociados' ? (
            <>
              <Link href="/asociados" style={{ opacity: 0.8, whiteSpace: 'nowrap' }}>Gremio</Link>
              <Link href="/asociados" style={{ opacity: 0.8, whiteSpace: 'nowrap' }}>Beneficios</Link>
              <Link href="/asociados" style={{ opacity: 0.8, whiteSpace: 'nowrap' }}>Autorregulación</Link>
            </>
          ) : currentSegment === 'instituciones' ? (
            <>
              <Link href="/instituciones" style={{ opacity: 0.8, whiteSpace: 'nowrap' }}>AMIB Certificación</Link>
              <Link href="/instituciones" style={{ opacity: 0.8, whiteSpace: 'nowrap' }}>Centro Educativo</Link>
              <Link href="/certificaciones" style={{ opacity: 0.8, whiteSpace: 'nowrap' }}>Guías</Link>
            </>
          ) : (
            <>
              <Link href="/" style={{ opacity: 0.8, whiteSpace: 'nowrap' }}>Market</Link>
              <Link href="/certificaciones" style={{ opacity: 0.8, whiteSpace: 'nowrap' }}>Certificación</Link>
              <Link href="/" style={{ opacity: 0.8, whiteSpace: 'nowrap' }}>Nosotros</Link>
            </>
          )}
        </nav>

        <form onSubmit={handleSearch} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: isScrolled ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.08)',
              border: isScrolled ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: '100px',
              padding: '0.4rem 1rem 0.4rem 2.2rem',
              fontSize: '0.75rem',
              color: 'inherit',
              width: '120px',
              outline: 'none',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(5px)'
            }}
            onFocus={(e) => e.currentTarget.style.width = '180px'}
            onBlur={(e) => e.currentTarget.style.width = '120px'}
          />
          <svg 
            style={{ position: 'absolute', left: '0.75rem', width: '0.8rem', height: '0.8rem', opacity: 0.4 }} 
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </form>
      </div>
    </motion.header>
  );
}
