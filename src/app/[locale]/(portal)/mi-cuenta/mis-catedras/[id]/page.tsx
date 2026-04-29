'use client';

import React, { useState, useEffect, use } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CatedraDashboardPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = use(params);
  const [catedra, setCatedra] = useState<any>(null);
  const [materias, setMaterias] = useState<any[]>([]);
  const [stats, setStats] = useState({ alumnos: 0, sesiones: 0, proximaSesion: null as any });
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchAll();
  }, [id]);

  const fetchAll = async () => {
    // Cátedra info
    const { data: catData } = await supabase
      .from('catedras')
      .select('*, instituciones_educativas (*)')
      .eq('id', id)
      .single();
    setCatedra(catData);

    // Materias con profesores
    const { data: matData } = await supabase
      .from('materias')
      .select('*, profesores (*)')
      .eq('catedra_id', id)
      .order('fecha_inicio', { ascending: true });
    setMaterias(matData || []);

    // Alumnos count
    const { count: alumnosCount } = await supabase
      .from('catedra_alumnos')
      .select('*', { count: 'exact', head: true })
      .eq('catedra_id', id);

    // Próxima sesión
    const { data: sesiones } = await supabase
      .from('sesiones_catedra')
      .select('*')
      .eq('catedra_id', id)
      .gte('fecha_sesion', new Date().toISOString().split('T')[0])
      .order('fecha_sesion', { ascending: true })
      .limit(1);

    // Total sesiones
    const { count: sesionesCount } = await supabase
      .from('sesiones_catedra')
      .select('*', { count: 'exact', head: true })
      .eq('catedra_id', id);

    setStats({
      alumnos: alumnosCount || 0,
      sesiones: sesionesCount || 0,
      proximaSesion: sesiones?.[0] || null,
    });
    setLoading(false);
  };

  // Design tokens
  const gold = '#EAAB00';
  const card: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.07)',
    padding: '1.5rem',
    backdropFilter: 'blur(8px)',
  };
  const muted = 'rgba(255,255,255,0.4)';
  const text = 'rgba(255,255,255,0.85)';

  if (loading) return <div style={{ color: muted, padding: '2rem' }}>Cargando panel de cátedra...</div>;
  if (!catedra) return <div style={{ color: muted, padding: '2rem' }}>Cátedra no encontrada.</div>;

  const quickLinks = [
    { label: 'Gestión de Alumnos', desc: 'Alta individual, carga masiva CSV', href: `/${locale}/mi-cuenta/mis-catedras/${id}/alumnos`, icon: '👥' },
    { label: 'Calendario de Sesiones', desc: 'Presencial / En línea, generar QR', href: `/${locale}/mi-cuenta/mis-catedras/${id}/sesiones`, icon: '📅' },
    { label: 'Actividad del Profesor', desc: 'Materiales, calificaciones, entregas', href: `/${locale}/mi-cuenta/mis-catedras/${id}/actividad`, icon: '📊' },
  ];

  return (
    <div>
      {/* Back + Header */}
      <Link href={`/${locale}/mi-cuenta/mis-catedras`} style={{ color: muted, textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        ← Mis Cátedras
      </Link>

      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: gold, fontWeight: 700, letterSpacing: '0.2em', marginBottom: '0.5rem', opacity: 0.85 }}>
          Panel de Encargado
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
          {catedra.nombre}
        </h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>{catedra.instituciones_educativas?.nombre}</span>
          <span style={{
            fontSize: '0.65rem', padding: '0.2rem 0.5rem',
            background: catedra.estatus === 'ACTIVA' ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)',
            color: catedra.estatus === 'ACTIVA' ? '#4ade80' : 'rgba(255,255,255,0.5)',
            borderRadius: '4px', fontWeight: 700,
          }}>
            {catedra.estatus}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {[
          { label: 'Alumnos Inscritos', value: stats.alumnos, icon: '👥' },
          { label: 'Sesiones Programadas', value: stats.sesiones, icon: '📅' },
          { label: 'Materias', value: materias.length, icon: '📚' },
          { label: 'Próxima Sesión', value: stats.proximaSesion ? new Date(stats.proximaSesion.fecha_sesion).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' }) : '—', icon: '🔔', highlight: !!stats.proximaSesion },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            style={{ ...card, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
          >
            <div style={{ fontSize: '1.2rem' }}>{stat.icon}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: stat.highlight ? gold : 'white' }}>{stat.value}</div>
            <div style={{ fontSize: '0.75rem', color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {quickLinks.map((link, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
          >
            <Link href={link.href} style={{ textDecoration: 'none' }}>
              <div style={{
                ...card,
                cursor: 'pointer',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(234,171,0,0.25)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: 'rgba(234,171,0,0.08)', border: '1px solid rgba(234,171,0,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.3rem', flexShrink: 0
                }}>
                  {link.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: text, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{link.label}</div>
                  <div style={{ fontSize: '0.78rem', color: muted }}>{link.desc}</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: 'auto', color: muted, flexShrink: 0 }}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Materias & Professors */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: text, marginBottom: '1.25rem' }}>Materias del Programa</h3>
        {materias.length === 0 ? (
          <div style={{ ...card, textAlign: 'center', padding: '2.5rem', color: muted }}>
            No hay materias registradas. El administrador debe configurarlas.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {materias.map((mat, i) => (
              <motion.div
                key={mat.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                style={{ ...card, display: 'flex', alignItems: 'center', gap: '1rem' }}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: '#001F3F', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0
                }}>
                  {mat.profesores?.nombre?.substring(0, 2).toUpperCase() || 'P'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: text, fontSize: '0.9rem' }}>{mat.nombre}</div>
                  <div style={{ fontSize: '0.75rem', color: muted }}>{mat.profesores?.nombre || 'Sin profesor'} · {mat.profesores?.especialidad || ''}</div>
                </div>
                <span style={{
                  fontSize: '0.65rem', padding: '0.15rem 0.4rem',
                  background: mat.estatus === 'ACTIVA' ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)',
                  color: mat.estatus === 'ACTIVA' ? '#4ade80' : 'rgba(255,255,255,0.5)',
                  borderRadius: '4px', fontWeight: 600
                }}>
                  {mat.estatus}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
