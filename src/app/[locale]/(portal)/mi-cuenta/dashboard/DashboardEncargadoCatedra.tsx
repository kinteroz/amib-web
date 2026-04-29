'use client';

import React, { useState, useEffect } from 'react';
import styles from '@/components/portal/portal.module.css';
import { createBrowserClient } from '@supabase/ssr';
import { motion } from 'framer-motion';
import Link from 'next/link';

export function DashboardEncargadoCatedra({ user, locale }: { user: any; locale: string }) {
  const [stats, setStats] = useState({
    catedras: 0,
    alumnos: 0,
    sesionesProximas: 0,
  });
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      // 1. Cátedras
      const { data: catedras } = await supabase
        .from('catedras')
        .select('id')
        .eq('encargado_amib_id', user.id);
      
      const catIds = catedras?.map(c => c.id) || [];

      // 2. Alumnos inscritos en esas cátedras
      const { count: alumnosCount } = await supabase
        .from('catedra_alumnos')
        .select('*', { count: 'exact', head: true })
        .in('catedra_id', catIds);

      // 3. Sesiones próximas
      const { count: sesionesCount } = await supabase
        .from('sesiones_catedra')
        .select('*', { count: 'exact', head: true })
        .in('catedra_id', catIds)
        .gte('fecha_sesion', new Date().toISOString().split('T')[0]);

      setStats({
        catedras: catIds.length,
        alumnos: alumnosCount || 0,
        sesionesProximas: sesionesCount || 0,
      });
      setLoading(false);
    };

    fetchDashboardData();
  }, [user]);

  const card = { background: 'rgba(255,255,255,0.04)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.07)', padding: '1.25rem' };
  const gold = 'var(--color-secondary-container, #EAAB00)';
  const navy = '#060e1c';
  const text = 'rgba(255,255,255,0.85)';
  const muted = 'rgba(255,255,255,0.4)';

  if (loading) return <div style={{ color: muted, padding: '2rem' }}>Cargando panel de control...</div>;

  return (
    <div>
      <div className={styles.welcomeBanner}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div className={styles.eyebrow}>Centro Educativo AMIB</div>
          <h1 className={styles.bannerTitle}>Bienvenido, {user.name?.split(' ')[0]}.</h1>
          <p style={{ opacity: 0.6, maxWidth: '560px', fontSize: '1rem', lineHeight: 1.7 }}>
            Gestione sus cátedras, supervise el calendario escolar y administre a los alumnos inscritos en los programas bajo su coordinación.
          </p>
          <div className={styles.bannerActions}>
            <Link href={`/${locale}/mi-cuenta/mis-catedras`} style={{ background: gold, color: navy, border: 'none', padding: '0.8rem 1.75rem', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'none' }}>
              Ver Mis Cátedras →
            </Link>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {[
          { label: 'Cátedras Asignadas', value: stats.catedras, icon: '🎓' },
          { label: 'Alumnos Totales', value: stats.alumnos, icon: '👥' },
          { label: 'Sesiones Próximas', value: stats.sesionesProximas, icon: '📅', highlight: stats.sesionesProximas > 0 },
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
    </div>
  );
}
