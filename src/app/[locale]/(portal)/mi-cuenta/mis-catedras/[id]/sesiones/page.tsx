'use client';

import React, { useState, useEffect, use } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function SesionesCatedraPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = use(params);
  const [catedra, setCatedra] = useState<any>(null);
  const [sesiones, setSesiones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    nombre_sesion: '',
    fecha_sesion: '',
    hora_inicio: '',
    hora_fin: '',
    modalidad: 'PRESENCIAL',
    enlace_sesion: ''
  });

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

    const { data: sesData } = await supabase
      .from('sesiones_catedra')
      .select('*')
      .eq('catedra_id', id)
      .order('fecha_sesion', { ascending: true });
    setSesiones(sesData || []);
    setLoading(false);
  };

  const handleAddSesion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre_sesion || !formData.fecha_sesion) return;
    setSaving(true);

    try {
      const qrToken = `SES-${id.split('-')[0]}-${Date.now()}`;
      
      const { error } = await supabase
        .from('sesiones_catedra')
        .insert({
          catedra_id: id,
          nombre_sesion: formData.nombre_sesion,
          fecha_sesion: formData.fecha_sesion,
          hora_inicio: formData.hora_inicio || null,
          hora_fin: formData.hora_fin || null,
          modalidad: formData.modalidad,
          enlace_sesion: formData.enlace_sesion || null,
          qr_token: qrToken,
          estatus: 'PROGRAMADA'
        });

      if (error) throw error;

      setFormData({ nombre_sesion: '', fecha_sesion: '', hora_inicio: '', hora_fin: '', modalidad: 'PRESENCIAL', enlace_sesion: '' });
      setShowAddForm(false);
      fetchData();
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
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
  };
  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '0.75rem 1rem',
    color: 'white',
    fontSize: '0.85rem',
    outline: 'none',
  };

  if (loading) return <div style={{ color: muted, padding: '2rem' }}>Cargando sesiones...</div>;

  return (
    <div>
      <Link href={`/${locale}/mi-cuenta/mis-catedras/${id}`} style={{ color: muted, textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        ← {catedra?.nombre || 'Volver'}
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: gold, fontWeight: 700, letterSpacing: '0.2em', marginBottom: '0.5rem' }}>
            Calendario Escolar
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
            Sesiones Programadas
          </h1>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            background: gold, color: '#001F3F', border: 'none',
            padding: '0.7rem 1.25rem', borderRadius: '10px',
            fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer'
          }}
        >
          + Nueva Sesión
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          onSubmit={handleAddSesion}
          style={{
            ...card,
            padding: '1.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <h3 style={{ fontWeight: 700, color: text, fontSize: '1rem', marginBottom: '1rem' }}>Programar Sesión</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Tema / Nombre *</label>
              <input style={inputStyle} value={formData.nombre_sesion} onChange={(e) => setFormData({ ...formData, nombre_sesion: e.target.value })} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Modalidad</label>
              <select style={inputStyle} value={formData.modalidad} onChange={(e) => setFormData({ ...formData, modalidad: e.target.value })}>
                <option value="PRESENCIAL">Presencial</option>
                <option value="EN_LINEA">En Línea</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Fecha *</label>
              <input type="date" style={inputStyle} value={formData.fecha_sesion} onChange={(e) => setFormData({ ...formData, fecha_sesion: e.target.value })} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Hora de Inicio</label>
              <input type="time" style={inputStyle} value={formData.hora_inicio} onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Hora de Fin</label>
              <input type="time" style={inputStyle} value={formData.hora_fin} onChange={(e) => setFormData({ ...formData, hora_fin: e.target.value })} />
            </div>
          </div>

          {formData.modalidad === 'EN_LINEA' && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.7rem', color: muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Enlace a la Sesión (Zoom/Teams)</label>
              <input type="url" style={inputStyle} value={formData.enlace_sesion} onChange={(e) => setFormData({ ...formData, enlace_sesion: e.target.value })} placeholder="https://..." />
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setShowAddForm(false)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.6rem 1.25rem', borderRadius: '8px', fontSize: '0.82rem', cursor: 'pointer' }}>
              Cancelar
            </button>
            <button type="submit" disabled={saving} style={{ background: gold, color: '#001F3F', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Guardando...' : 'Programar'}
            </button>
          </div>
        </motion.form>
      )}

      {/* Sesiones Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {sesiones.length === 0 ? (
          <div style={{ ...card, padding: '3rem', textAlign: 'center', color: muted }}>
            No hay sesiones programadas en esta cátedra.
          </div>
        ) : sesiones.map((ses, i) => {
          const isEnLinea = ses.modalidad === 'EN_LINEA';
          return (
            <motion.div
              key={ses.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{ ...card, padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}
            >
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem', borderRadius: '12px', textAlign: 'center', minWidth: '64px' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, color: muted, textTransform: 'uppercase' }}>
                  {new Date(ses.fecha_sesion).toLocaleString('es-MX', { month: 'short' }).toUpperCase()}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>
                  {new Date(ses.fecha_sesion).getDate() + 1}
                </div>
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: text, fontSize: '1rem' }}>{ses.nombre_sesion || `Sesión del ${ses.fecha_sesion}`}</div>
                <div style={{ fontSize: '0.8rem', color: muted, marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span>🕒 {ses.hora_inicio || '--:--'} - {ses.hora_fin || '--:--'}</span>
                  <span style={{ 
                    color: isEnLinea ? '#60a5fa' : '#c084fc',
                    background: isEnLinea ? 'rgba(59,130,246,0.15)' : 'rgba(192,132,252,0.15)',
                    padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700
                  }}>
                    {isEnLinea ? 'EN LÍNEA' : 'PRESENCIAL'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div>
                {isEnLinea ? (
                  <a href={ses.enlace_sesion || '#'} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)', padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>
                    🔗 Unirse
                  </a>
                ) : (
                  <button style={{ background: 'rgba(234,171,0,0.1)', color: gold, border: '1px solid rgba(234,171,0,0.2)', padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                    📱 Generar QR
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
