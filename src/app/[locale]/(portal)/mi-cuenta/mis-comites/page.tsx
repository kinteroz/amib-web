'use client';

import React, { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';

export default function MisComitesPage() {
  const { locale } = useParams();
  const [comites, setComites] = useState<any[]>([]);
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
          .from('comites_maestro')
          .select(`
            *,
            sesiones:comites_sesiones(count),
            miembros:comites_miembros(count)
          `)
          .eq('coordinador_amib_id', u.id)
          .eq('activo', true)
          .order('created_at', { ascending: false });
        setComites(data || []);
      }
      setLoading(false);
    };
    init();
  }, []);

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
          Mis Comités
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem' }}>Gestiona los comités bajo tu responsabilidad.</p>
      </div>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Cargando comités...</p>
      ) : comites.length === 0 ? (
        <div style={{ background: '#f8fafc', border: '2px dashed #e2e8f0', borderRadius: '16px', padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🏛️</div>
          <p style={{ color: '#64748b', fontWeight: 600 }}>Aún no tienes comités asignados.</p>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>El Administrador debe asignarte como coordinador de un comité.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {comites.map((comite, i) => (
            <motion.div
              key={comite.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={cardStyle}
            >
              {/* Badge */}
              <span style={{
                alignSelf: 'flex-start',
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
                Coordinador
              </span>

              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>{comite.nombre}</h2>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)' }}>{comite.area_responsable}</p>
              </div>

              {comite.objetivo && (
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                  {comite.objetivo}
                </p>
              )}

              {/* Stats */}
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#EAAB00' }}>
                    {comite.sesiones?.[0]?.count ?? 0}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sesiones</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#EAAB00' }}>
                    {comite.miembros?.[0]?.count ?? 0}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Miembros</div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Link
                  href={`/${locale}/mi-cuenta/mis-comites/sesiones?comite=${comite.id}`}
                  style={{
                    flex: 1, textAlign: 'center', padding: '0.65rem',
                    background: '#EAAB00', color: '#001F3F', borderRadius: '8px',
                    fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none'
                  }}
                >
                  Ver Sesiones
                </Link>
                <Link
                  href={`/${locale}/mi-cuenta/mis-comites/minutas?comite=${comite.id}`}
                  style={{
                    flex: 1, textAlign: 'center', padding: '0.65rem',
                    background: 'rgba(255,255,255,0.08)', color: 'white', borderRadius: '8px',
                    fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none'
                  }}
                >
                  Minutas
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
