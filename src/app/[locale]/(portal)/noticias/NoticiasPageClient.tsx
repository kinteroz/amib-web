'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { getNoticiasPublicadas } from '@/lib/cms-actions';

const CATEGORIAS = ['TODAS', 'INSTITUCIONAL', 'MERCADOS', 'EDUCACION', 'PRENSA'];
const PAGE_SIZE = 9;

type Noticia = {
  id: string;
  titulo: string;
  resumen: string | null;
  imagen_url: string | null;
  video_url: string | null;
  slug: string;
  categoria: string | null;
  fecha_publicacion: string | null;
};

interface NoticiasPageClientProps {
  initialNoticias: Noticia[];
}

export function NoticiasPageClient({ initialNoticias }: NoticiasPageClientProps) {
  const [noticias, setNoticias] = useState<Noticia[]>(initialNoticias);
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('TODAS');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(initialNoticias.length === PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searching, setSearching] = useState(false);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Re-fetch when search or categoria changes
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await getNoticiasPublicadas({ page: 0, limit: PAGE_SIZE, search: search || undefined, categoria });
        setNoticias(data);
        setPage(0);
        setHasMore(data.length === PAGE_SIZE);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search, categoria]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const data = await getNoticiasPublicadas({ page: nextPage, limit: PAGE_SIZE, search: search || undefined, categoria });
      setNoticias(prev => [...prev, ...data]);
      setPage(nextPage);
      setHasMore(data.length === PAGE_SIZE);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page, search, categoria]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    observerRef.current?.disconnect();
    if (!sentinelRef.current) return;
    observerRef.current = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { rootMargin: '200px' }
    );
    observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [loadMore]);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
      {/* Search + Filtros */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '3rem', alignItems: 'center' }}>
        <div style={{ flex: '1 1 300px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', fontSize: '1.1rem' }}>🔍</span>
          <input
            type="text"
            placeholder="Buscar noticias..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.9rem 1rem 0.9rem 2.8rem',
              borderRadius: '50px',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.06)',
              color: 'white',
              fontSize: '1rem',
              outline: 'none',
              backdropFilter: 'blur(8px)',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {CATEGORIAS.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoria(cat)}
              style={{
                padding: '0.55rem 1.2rem',
                borderRadius: '50px',
                border: '1px solid',
                borderColor: categoria === cat ? 'var(--color-secondary-container)' : 'rgba(255,255,255,0.15)',
                background: categoria === cat ? 'var(--color-secondary-container)' : 'transparent',
                color: categoria === cat ? '#001F3F' : 'rgba(255,255,255,0.7)',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                transition: 'all 0.2s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {searching ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{ borderRadius: '24px', overflow: 'hidden', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', height: '380px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : noticias.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '6rem 2rem', color: 'rgba(255,255,255,0.4)' }}>
          <p style={{ fontSize: '1.2rem' }}>No se encontraron noticias con esos criterios.</p>
          <button
            onClick={() => { setSearch(''); setCategoria('TODAS'); }}
            style={{ marginTop: '1rem', padding: '0.75rem 2rem', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'white', cursor: 'pointer', fontWeight: 600 }}
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
          {noticias.map(noticia => (
            <Link
              key={noticia.id}
              href={`/noticias/${noticia.slug}`}
              style={{
                borderRadius: '24px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                textDecoration: 'none',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                transition: 'transform 0.25s ease, border-color 0.25s ease, background 0.25s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(234,183,0,0.3)';
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
              }}
            >
              {/* Thumbnail */}
              <div style={{ position: 'relative', width: '100%', aspectRatio: '16/10', background: '#001F3F', overflow: 'hidden', flexShrink: 0 }}>
                {noticia.video_url ? (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {noticia.imagen_url && <img src={noticia.imagen_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />}
                    <div style={{ position: 'relative', zIndex: 1, background: 'rgba(0,0,0,0.5)', width: '52px', height: '52px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                      <span style={{ color: 'white', marginLeft: '4px', fontSize: '1.2rem' }}>▶</span>
                    </div>
                  </div>
                ) : noticia.imagen_url ? (
                  <img src={noticia.imagen_url} alt={noticia.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.08)', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '0.2em' }}>AMIB</div>
                )}
                <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', padding: '0.3rem 0.7rem', borderRadius: '6px', fontSize: '0.65rem', color: 'white', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {noticia.categoria || 'General'}
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', lineHeight: 1.35, color: 'white', fontWeight: 800 }}>
                  {noticia.titulo}
                </h3>
                <p style={{
                  color: 'rgba(255,255,255,0.55)',
                  fontSize: '0.9rem',
                  flex: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: 1.6
                }}>
                  {noticia.resumen}
                </p>
                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
                    {noticia.fecha_publicacion
                      ? new Date(noticia.fecha_publicacion).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
                      : ''}
                  </span>
                  <span style={{ color: 'var(--color-secondary-container)', fontWeight: 700, fontSize: '0.82rem' }}>
                    Leer más →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Sentinel para infinite scroll */}
      <div ref={sentinelRef} style={{ height: '1px', marginTop: '2rem' }} />

      {/* Loading indicator */}
      {loadingMore && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
          Cargando más noticias...
        </div>
      )}

      {!hasMore && noticias.length > 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.25)', fontSize: '0.85rem' }}>
          Has visto todas las noticias disponibles
        </div>
      )}
    </div>
  );
}
