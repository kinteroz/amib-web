'use client';

import React, { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';

export default function MisCatedrasPage() {
  const { locale } = useParams();
  const [catedras, setCatedras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const init = async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u);
      if (u) {
        const { data } = await supabase
          .from('catedras')
          .select(`
            *,
            instituciones_educativas (nombre),
            materias (count),
            catedra_alumnos (count)
          `)
          .eq('encargado_amib_id', u.id)
          .order('fecha_inicio', { ascending: false });
        setCatedras(data || []);
      }
      setLoading(false);
    };
    init();
  }, []);

  // Design tokens (matching portal theme)
  const gold = 'var(--color-secondary-container, #EAAB00)';
  const navy = '#060e1c';

  const cardStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #001F3F 0%, #002b5c 100%)',
    borderRadius: '16px',
    padding: '2rem',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 8px 32px rgba(0,31,63,0.3)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
          Mis Cátedras
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem' }}>Gestiona los programas educativos bajo tu responsabilidad.</p>
      </div>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Cargando cátedras...</p>
      ) : catedras.length === 0 ? (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '16px', padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎓</div>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Aún no tienes cátedras asignadas.</p>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.875rem' }}>El Administrador debe asignarte como encargado de una cátedra.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {catedras.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={cardStyle}
            >
              {/* Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{
                  background: 'rgba(234,171,0,0.15)',
                  color: '#EAAB00',
                  border: '1px solid rgba(234,171,0,0.3)',
                  borderRadius: '999px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}>
                  Encargado
                </span>
                <span style={{
                  fontSize: '0.65rem',
                  padding: '0.2rem 0.5rem',
                  background: cat.estatus === 'ACTIVA' ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)',
                  color: cat.estatus === 'ACTIVA' ? '#4ade80' : 'rgba(255,255,255,0.5)',
                  borderRadius: '4px',
                  fontWeight: 700,
                }}>
                  {cat.estatus}
                </span>
              </div>

              {/* Info */}
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem' }}>{cat.nombre}</h2>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)' }}>{cat.instituciones_educativas?.nombre || 'Sin institución'}</p>
              </div>

              {cat.descripcion && (
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {cat.descripcion}
                </p>
              )}

              {/* Dates */}
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', display: 'flex', gap: '1rem' }}>
                <span>📅 {cat.fecha_inicio ? new Date(cat.fecha_inicio).toLocaleDateString('es-MX', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Sin fecha'}</span>
                <span>→ {cat.fecha_fin ? new Date(cat.fecha_fin).toLocaleDateString('es-MX', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Sin fecha'}</span>
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#EAAB00' }}>
                    {cat.catedra_alumnos?.[0]?.count ?? 0}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Alumnos</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#EAAB00' }}>
                    {cat.materias?.[0]?.count ?? 0}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Materias</div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Link
                  href={`/${locale}/mi-cuenta/mis-catedras/${cat.id}`}
                  style={{
                    flex: 1, textAlign: 'center', padding: '0.65rem',
                    background: '#EAAB00', color: '#001F3F', borderRadius: '8px',
                    fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none'
                  }}
                >
                  Gestionar
                </Link>
                <Link
                  href={`/${locale}/mi-cuenta/mis-catedras/${cat.id}/sesiones`}
                  style={{
                    flex: 1, textAlign: 'center', padding: '0.65rem',
                    background: 'rgba(255,255,255,0.08)', color: 'white', borderRadius: '8px',
                    fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none'
                  }}
                >
                  Sesiones
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
