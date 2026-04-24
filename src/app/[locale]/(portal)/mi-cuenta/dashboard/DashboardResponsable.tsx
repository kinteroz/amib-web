'use client';

import React, { useState, useEffect } from 'react';
import styles from '@/components/portal/portal.module.css';
import { createBrowserClient } from '@supabase/ssr';
import { motion } from 'framer-motion';

export function DashboardResponsable({ user, locale }: { user: any; locale: string }) {
  const [stats, setStats] = useState({
    comites: 0,
    sesiones: 0,
    minutasPendientes: 0,
    acuerdosAbiertos: 0
  });
  const [proximasSesiones, setProximasSesiones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      // 1. Comités bajo su responsabilidad
      const { data: comites } = await supabase
        .from('comites_maestro')
        .select('id')
        .eq('coordinador_amib_id', user.id)
        .eq('activo', true);

      const comiteIds = comites?.map(c => c.id) || [];

      // 2. Sesiones próximas
      const { data: sesiones } = await supabase
        .from('comites_sesiones')
        .select('*')
        .in('comite_id', comiteIds)
        .gte('fecha', new Date().toISOString().split('T')[0])
        .order('fecha', { ascending: true })
        .limit(3);

      // 3. Minutas pendientes de firma
      const { data: minutas } = await supabase
        .from('minutas')
        .select('id')
        .in('sesion_id', (await supabase.from('comites_sesiones').select('id').in('comite_id', comiteIds)).data?.map(s => s.id) || [])
        .eq('estado_firma', 'pendiente_firmas');

      // 4. Acuerdos abiertos
      const { data: acuerdos } = await supabase
        .from('comites_acuerdos')
        .select('id')
        .in('minuta_id', (await supabase.from('minutas').select('id').in('sesion_id', (await supabase.from('comites_sesiones').select('id').in('comite_id', comiteIds)).data?.map(s => s.id) || [])).data?.map(m => m.id) || [])
        .eq('estado', 'abierto');

      setStats({
        comites: comiteIds.length,
        sesiones: sesiones?.length || 0,
        minutasPendientes: minutas?.length || 0,
        acuerdosAbiertos: acuerdos?.length || 0
      });
      setProximasSesiones(sesiones || []);
      setLoading(false);
    };

    fetchDashboardData();
  }, [user]);

  // Design tokens
  const card = { background: 'rgba(255,255,255,0.04)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.07)', padding: '1.25rem' };
  const gold = 'var(--color-secondary-container, #EAAB00)';
  const navy = '#060e1c';
  const text = 'rgba(255,255,255,0.85)';
  const muted = 'rgba(255,255,255,0.4)';

  if (loading) {
    return <div style={{ color: muted, padding: '2rem' }}>Cargando panel de control...</div>;
  }

  return (
    <div>
      {/* Welcome Banner */}
      <div className={styles.welcomeBanner}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div className={styles.eyebrow}>Panel de Coordinación</div>
          <h1 className={styles.bannerTitle}>Bienvenido, {user.name?.split(' ')[0]}.</h1>
          <p style={{ opacity: 0.6, maxWidth: '560px', fontSize: '1rem', lineHeight: 1.7 }}>
            Gestione sus comités, supervise las sesiones programadas y dé seguimiento a los acuerdos pendientes.
          </p>
          <div className={styles.bannerActions}>
            <button style={{ background: gold, color: navy, border: 'none', padding: '0.8rem 1.75rem', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem' }}>
              Nueva Sesión
            </button>
            <button style={{ background: 'rgba(255,255,255,0.06)', color: 'white', border: '1px solid rgba(255,255,255,0.12)', padding: '0.8rem 1.75rem', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(10px)', fontSize: '0.9rem' }}>
              Ver Mis Comités →
            </button>
          </div>
        </div>
        <div style={{ position: 'absolute', top: '-20%', right: '-5%', width: '400px', height: '400px', background: `radial-gradient(circle, rgba(234,171,0,0.1) 0%, transparent 70%)`, borderRadius: '50%', pointerEvents: 'none' }} />
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {[
          { label: 'Mis Comités', value: stats.comites, icon: '🏛️' },
          { label: 'Sesiones Próximas', value: stats.sesiones, icon: '📅' },
          { label: 'Minutas por Firmar', value: stats.minutasPendientes, icon: '🖋️', highlight: stats.minutasPendientes > 0 },
          { label: 'Acuerdos Abiertos', value: stats.acuerdosAbiertos, icon: '✅' }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{ ...card, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
          >
            <div style={{ fontSize: '1.2rem' }}>{stat.icon}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: stat.highlight ? gold : 'white' }}>{stat.value}</div>
            <div style={{ fontSize: '0.75rem', color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
        {/* Left Col: Next Sessions */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: text }}>Agenda de Sesiones</h3>
            <span style={{ fontSize: '0.75rem', color: gold, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em' }}>Calendario Completo →</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {proximasSesiones.length === 0 ? (
              <div style={{ ...card, color: muted, textAlign: 'center', padding: '3rem' }}>
                No hay sesiones programadas próximamente.
              </div>
            ) : (
              proximasSesiones.map((sesion, i) => (
                <div key={i} style={{ ...card, display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ background: `rgba(234,171,0,0.08)`, border: `1px solid rgba(234,171,0,0.2)`, padding: '0.75rem', borderRadius: '12px', textAlign: 'center', minWidth: '64px' }}>
                    <div style={{ fontSize: '0.6rem', fontWeight: 700, color: gold, textTransform: 'uppercase' }}>
                      {new Date(sesion.fecha).toLocaleString('es-MX', { month: 'short' }).toUpperCase()}
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: gold, lineHeight: 1 }}>
                      {new Date(sesion.fecha).getDate() + 1}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: text, fontSize: '0.95rem' }}>{sesion.nombre}</div>
                    <div style={{ fontSize: '0.8rem', color: muted, marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                      {sesion.hora_inicio} — {sesion.ubicacion}
                    </div>
                  </div>
                  <button style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', color: muted }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: Quick Tasks */}
        <div style={{ ...card, padding: '1.75rem', height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <div style={{ width: '36px', height: '36px', background: 'rgba(234,171,0,0.12)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: gold }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
            </div>
            <h3 style={{ fontWeight: 800, fontSize: '1rem', color: text }}>Tareas del Coordinador</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'Subir minuta de última sesión', done: false },
              { label: 'Revisar acuerdos vencidos', done: false },
              { label: 'Firmar acta extraordinaria', done: false },
              { label: 'Actualizar lista de miembros', done: true }
            ].map((task, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: task.done ? 0.4 : 1 }}>
                <div style={{ 
                  width: '18px', height: '18px', 
                  border: `2px solid ${task.done ? gold : 'rgba(255,255,255,0.2)'}`, 
                  borderRadius: '4px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: task.done ? gold : 'transparent'
                }}>
                  {task.done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={navy} strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>}
                </div>
                <span style={{ fontSize: '0.85rem', color: text, textDecoration: task.done ? 'line-through' : 'none' }}>{task.label}</span>
              </div>
            ))}
          </div>

          <button style={{ width: '100%', marginTop: '2rem', background: gold, border: 'none', padding: '0.875rem', borderRadius: '10px', color: navy, fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}>
            Gestionar Acuerdos →
          </button>
        </div>
      </div>
    </div>
  );
}
