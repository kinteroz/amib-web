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
  const [mesaModal, setMesaModal] = useState<any>(null); // comité padre al crear mesa
  const [mesaForm, setMesaForm] = useState({ nombre: '', objetivo: '' });
  const [savingMesa, setSavingMesa] = useState(false);
  const [mesaError, setMesaError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchComites = async (uid: string) => {
    const { data } = await supabase
      .from('comites_maestro')
      .select(`
        *,
        sesiones:comites_sesiones(count),
        miembros:comites_miembros(count)
      `)
      .eq('coordinador_amib_id', uid)
      .eq('activo', true)
      .order('created_at', { ascending: false });
    setComites(data || []);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u);
      if (u) await fetchComites(u.id);
      setLoading(false);
    };
    init();
  }, []);

  const crearMesa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !mesaModal) return;
    setSavingMesa(true);
    setMesaError(null);
    try {
      const { error } = await supabase.from('comites_maestro').insert([{
        nombre: mesaForm.nombre,
        objetivo: mesaForm.objetivo || null,
        area_responsable: mesaModal.area_responsable,
        coordinador_amib_id: user.id,
        parent_id: mesaModal.id,
        activo: true,
      }]);
      if (error) throw error;
      setMesaModal(null);
      setMesaForm({ nombre: '', objetivo: '' });
      await fetchComites(user.id);
    } catch (err: any) {
      setMesaError(err.message || 'No se pudo crear la mesa de trabajo.');
    } finally {
      setSavingMesa(false);
    }
  };

  const padres = comites.filter(c => !c.parent_id);
  const mesasDe = (comiteId: string) => comites.filter(c => c.parent_id === comiteId);

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
          {padres.map((comite, i) => (
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

              {/* Mesas de trabajo */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.9rem', marginTop: '0.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: mesasDe(comite.id).length > 0 ? '0.6rem' : 0 }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Mesas de trabajo ({mesasDe(comite.id).length})
                  </span>
                  <button
                    onClick={() => { setMesaModal(comite); setMesaForm({ nombre: '', objetivo: '' }); setMesaError(null); }}
                    style={{ background: 'none', border: '1px solid rgba(234,171,0,0.4)', color: '#EAAB00', borderRadius: '6px', padding: '0.2rem 0.6rem', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    + Mesa
                  </button>
                </div>
                {mesasDe(comite.id).map(mesa => (
                  <Link
                    key={mesa.id}
                    href={`/${locale}/mi-cuenta/mis-comites/sesiones?comite=${mesa.id}`}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.5rem 0.75rem',
                      marginBottom: '0.4rem', textDecoration: 'none',
                    }}
                  >
                    <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>🪑 {mesa.nombre}</span>
                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>
                      {mesa.sesiones?.[0]?.count ?? 0} sesiones →
                    </span>
                  </Link>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal Nueva Mesa de Trabajo */}
      {mesaModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={e => { if (e.target === e.currentTarget) setMesaModal(null); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            style={{ background: 'white', borderRadius: '20px', padding: '2.5rem', width: '100%', maxWidth: '520px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}
          >
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.3rem' }}>Nueva Mesa de Trabajo</h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.75rem' }}>
              Subgrupo de <strong>{mesaModal.nombre}</strong>. Tendrá sus propias sesiones, minutas y acuerdos, y reporta al pleno del comité.
            </p>
            <form onSubmit={crearMesa} style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'grid', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Nombre de la mesa *</label>
                <input
                  value={mesaForm.nombre}
                  onChange={e => setMesaForm({ ...mesaForm, nombre: e.target.value })}
                  placeholder="Ej. Mesa de Trabajo de Ciberseguridad"
                  style={{ padding: '0.7rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', color: '#0f172a' }}
                  required
                />
              </div>
              <div style={{ display: 'grid', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Objetivo</label>
                <textarea
                  value={mesaForm.objetivo}
                  onChange={e => setMesaForm({ ...mesaForm, objetivo: e.target.value })}
                  placeholder="¿Qué entregará esta mesa al pleno del comité?"
                  style={{ padding: '0.7rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', color: '#0f172a', height: '90px', resize: 'none', fontFamily: 'inherit' }}
                />
              </div>
              {mesaError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.75rem 1rem', color: '#dc2626', fontSize: '0.85rem' }}>{mesaError}</div>
              )}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setMesaModal(null)} style={{ padding: '0.7rem 1.4rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={savingMesa} style={{ padding: '0.7rem 1.6rem', borderRadius: '8px', border: 'none', background: '#001F3F', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', opacity: savingMesa ? 0.7 : 1 }}>
                  {savingMesa ? 'Creando…' : 'Crear Mesa'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
