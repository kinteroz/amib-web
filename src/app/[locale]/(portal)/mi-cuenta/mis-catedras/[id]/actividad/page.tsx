'use client';

import React, { useState, useEffect, use } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ActividadCatedraPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = use(params);
  const [catedra, setCatedra] = useState<any>(null);
  const [materias, setMaterias] = useState<any[]>([]);
  const [materiales, setMateriales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    const { data: catData } = await supabase
      .from('catedras')
      .select('nombre')
      .eq('id', id)
      .single();
    setCatedra(catData);

    const { data: matData } = await supabase
      .from('materias')
      .select('*, profesores(nombre)')
      .eq('catedra_id', id);
    setMaterias(matData || []);

    if (matData && matData.length > 0) {
      const matIds = matData.map((m: any) => m.id);
      const { data: files } = await supabase
        .from('clases_materiales')
        .select('*')
        .in('materia_id', matIds)
        .order('created_at', { ascending: false });
      setMateriales(files || []);
    }

    setLoading(false);
  };

  // Tokens
  const gold = '#EAAB00';
  const muted = 'rgba(255,255,255,0.4)';
  const text = 'rgba(255,255,255,0.85)';
  const card: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.07)',
    overflow: 'hidden',
    padding: '1.5rem'
  };

  if (loading) return <div style={{ color: muted, padding: '2rem' }}>Cargando actividad...</div>;

  return (
    <div>
      <Link href={`/${locale}/mi-cuenta/mis-catedras/${id}`} style={{ color: muted, textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        ← {catedra?.nombre || 'Volver'}
      </Link>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: gold, fontWeight: 700, letterSpacing: '0.2em', marginBottom: '0.5rem' }}>
          Supervisión
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
          Actividad del Profesorado
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
        {/* Materiales Recientes */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: text, marginBottom: '1rem' }}>Últimos Materiales Subidos</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {materiales.length === 0 ? (
              <div style={{ ...card, textAlign: 'center', color: muted, padding: '2rem' }}>
                Aún no hay materiales compartidos por los profesores.
              </div>
            ) : materiales.map((mat, i) => {
              const materiaInfo = materias.find(m => m.id === mat.materia_id);
              return (
                <motion.div
                  key={mat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{ ...card, padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                    📄
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: text, fontSize: '0.9rem' }}>{mat.titulo}</div>
                    <div style={{ fontSize: '0.75rem', color: muted, marginTop: '0.2rem' }}>
                      {materiaInfo?.nombre} · Prof. {materiaInfo?.profesores?.nombre}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.65rem', color: muted }}>
                    {new Date(mat.created_at).toLocaleDateString('es-MX')}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Resumen de Calificaciones */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: text, marginBottom: '1rem' }}>Status de Calificaciones</h3>
          <div style={{ ...card, padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🚧</div>
            <h4 style={{ color: text, fontWeight: 700, marginBottom: '0.5rem' }}>Módulo en Construcción</h4>
            <p style={{ color: muted, fontSize: '0.85rem', lineHeight: 1.5 }}>
              El visor completo de tareas y el libro de calificaciones estarán disponibles en la próxima fase del panel de supervisión.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
