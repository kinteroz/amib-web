'use client';

import React, { useState, useRef, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import type { Database } from '@/types/database.types';
import type { OficioExtraido, TareaSugerida } from '@/app/api/oficios/procesar/route';

type Fase = 'upload' | 'procesando' | 'revision' | 'guardando' | 'listo';

const CRITICIDAD_STYLE: Record<string, { color: string; bg: string }> = {
  alta:   { color: '#EF4444', bg: 'rgba(239,68,68,0.12)'    },
  media:  { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)'   },
  baja:   { color: '#10B981', bg: 'rgba(16,185,129,0.12)'   },
};

export default function NuevoOficioPage() {
  const { locale } = useParams();
  const router = useRouter();

  const [fase, setFase] = useState<Fase>('upload');
  const [archivoNombre, setArchivoNombre] = useState('');
  const [archivoFile, setArchivoFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  // Datos extraídos por la IA (editables)
  const [datos, setDatos] = useState<OficioExtraido | null>(null);
  const [tareas, setTareas] = useState<TareaSugerida[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // ── Manejo del archivo ──────────────────────────────────────
  const procesarArchivo = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Solo se aceptan archivos PDF.');
      return;
    }
    setError('');
    setArchivoNombre(file.name);
    setArchivoFile(file);
    setFase('procesando');

    try {
      const form = new FormData();
      form.append('pdf', file);

      const res = await fetch('/api/oficios/procesar', { method: 'POST', body: form });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error ?? 'Error al procesar el PDF.');
      }

      setDatos(json.data as OficioExtraido);
      setTareas(json.data.tareas_sugeridas ?? []);
      setFase('revision');
    } catch (err: any) {
      setError(err.message ?? 'Ocurrió un error inesperado.');
      setFase('upload');
    }
  }, []);

  const onDropZone = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) procesarArchivo(file);
  }, [procesarArchivo]);

  // ── Guardar oficio ──────────────────────────────────────────
  const guardarOficio = async () => {
    if (!datos) return;
    setFase('guardando');
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sesión expirada. Recarga la página.');

      // Subir PDF a Storage (bucket: oficios-pdfs)
      let pdf_url: string | null = null;
      let pdf_nombre: string | null = null;

      if (archivoFile) {
        const ext = archivoFile.name.split('.').pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: storageError } = await supabase.storage
          .from('oficios-pdfs')
          .upload(path, archivoFile, { upsert: false });

        if (!storageError) {
          pdf_url = path;
          pdf_nombre = archivoFile.name;
        }
      }

      // Insertar oficio
      const { data: oficio, error: insertError } = await supabase
        .from('oficios')
        .insert({
          numero_oficio:      datos.numero_oficio,
          titulo:             datos.titulo,
          pdf_url,
          pdf_nombre,
          fecha_recepcion:    datos.fecha_recepcion,
          fecha_efectos:      datos.fecha_efectos ?? null,
          plazo_dias_habiles: datos.plazo_dias_habiles,
          estatus:            'pendiente',
          resumen_ia:         datos.resumen,
          datos_extraidos_ia: datos as any,
          created_by:         user.id,
        })
        .select('id')
        .single();

      if (insertError) throw new Error(insertError.message);

      // Insertar tareas sugeridas
      if (tareas.length > 0 && oficio) {
        await supabase.from('oficio_tareas').insert(
          tareas.map((t, i) => ({
            oficio_id:        oficio.id,
            numero:           t.numero,
            descripcion:      t.descripcion,
            area_responsable: t.area_responsable,
            estatus:          'pendiente' as const,
            orden:            i,
          }))
        );
      }

      setFase('listo');
      setTimeout(() => router.push(`/${locale}/mi-cuenta/oficios/${oficio!.id}`), 1500);

    } catch (err: any) {
      setError(err.message ?? 'Error al guardar el oficio.');
      setFase('revision');
    }
  };

  // ── Render ──────────────────────────────────────────────────
  return (
    <div style={{ padding: '2rem', maxWidth: '860px' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <Link
          href={`/${locale}/mi-cuenta/oficios`}
          style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          Volver a oficios
        </Link>
        <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#EAAB00', marginBottom: '0.35rem' }}>
          Nuevo oficio CNBV
        </p>
        <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: '#fff', margin: 0 }}>
          Registrar oficio
        </h1>
      </div>

      {/* Steps indicator */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', alignItems: 'center' }}>
        {[
          { key: 'upload',    label: '1. Subir PDF' },
          { key: 'revision',  label: '2. Revisar extracción' },
          { key: 'listo',     label: '3. Registrado' },
        ].map((step, i, arr) => {
          const activo = fase === step.key || (fase === 'procesando' && step.key === 'upload') || (fase === 'guardando' && step.key === 'revision');
          const completo = (i === 0 && ['revision','guardando','listo'].includes(fase)) || (i === 1 && fase === 'listo');
          return (
            <React.Fragment key={step.key}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%', fontSize: '0.65rem', fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: completo ? '#10B981' : activo ? '#EAAB00' : 'rgba(255,255,255,0.08)',
                  color: completo || activo ? '#000' : 'rgba(255,255,255,0.3)',
                  flexShrink: 0,
                }}>
                  {completo ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: activo ? '#EAAB00' : completo ? '#10B981' : 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>
                  {step.label}
                </span>
              </div>
              {i < arr.length - 1 && (
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)', maxWidth: '60px' }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.5rem',
              color: '#FCA5A5', fontSize: '0.82rem', display: 'flex', gap: '0.5rem', alignItems: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">

        {/* ── FASE: Upload ── */}
        {fase === 'upload' && (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDropZone}
              onClick={() => inputRef.current?.click()}
              style={{
                border: `2px dashed ${dragging ? '#EAAB00' : 'rgba(255,255,255,0.12)'}`,
                borderRadius: '18px', padding: '4rem 2rem', textAlign: 'center', cursor: 'pointer',
                background: dragging ? 'rgba(234,171,0,0.05)' : 'rgba(255,255,255,0.02)',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', margin: '0 0 0.4rem' }}>
                Arrastra el PDF del oficio aquí
              </p>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', margin: '0 0 1.5rem' }}>
                o haz clic para seleccionarlo
              </p>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'rgba(234,171,0,0.12)', color: '#EAAB00',
                border: '1px solid rgba(234,171,0,0.3)', borderRadius: '8px',
                padding: '0.5rem 1.25rem', fontSize: '0.78rem', fontWeight: 700,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                Seleccionar PDF
              </div>
            </div>
            <input ref={inputRef} type="file" accept=".pdf" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) procesarArchivo(f); }} />
          </motion.div>
        )}

        {/* ── FASE: Procesando ── */}
        {fase === 'procesando' && (
          <motion.div key="procesando" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '18px', padding: '4rem 2rem', textAlign: 'center',
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              style={{ width: '48px', height: '48px', margin: '0 auto 1.5rem', border: '3px solid rgba(234,171,0,0.2)', borderTopColor: '#EAAB00', borderRadius: '50%' }}
            />
            <p style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', margin: '0 0 0.4rem' }}>
              Analizando oficio con IA…
            </p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', margin: 0 }}>
              {archivoNombre}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem', margin: '0.75rem 0 0' }}>
              Claude está extrayendo datos, plazo y requerimientos. Esto toma unos segundos.
            </p>
          </motion.div>
        )}

        {/* ── FASE: Revisión ── */}
        {fase === 'revision' && datos && (
          <motion.div key="revision" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

            {/* Banner AI */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              background: 'rgba(234,171,0,0.07)', border: '1px solid rgba(234,171,0,0.2)',
              borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.5rem',
              fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)',
            }}>
              <span style={{ color: '#EAAB00', fontSize: '1.1rem' }}>✦</span>
              <span>La IA extrajo los datos del oficio. <strong style={{ color: 'rgba(255,255,255,0.85)' }}>Revisa y ajusta</strong> cualquier campo antes de registrar.</span>
              <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.35)', flexShrink: 0 }}>
                {archivoNombre}
              </span>
            </div>

            {/* Campos del oficio */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 1.25rem' }}>
                Datos del oficio
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

                <Campo label="Número de oficio" fullWidth>
                  <input value={datos.numero_oficio} onChange={e => setDatos({ ...datos, numero_oficio: e.target.value })} style={inputStyle} />
                </Campo>

                <Campo label="Criticidad">
                  <select value={datos.criticidad} onChange={e => setDatos({ ...datos, criticidad: e.target.value as any })} style={inputStyle}>
                    <option value="alta">Alta</option>
                    <option value="media">Media</option>
                    <option value="baja">Baja</option>
                  </select>
                </Campo>

                <Campo label="Fecha de recepción">
                  <input type="date" value={datos.fecha_recepcion} onChange={e => setDatos({ ...datos, fecha_recepcion: e.target.value })} style={inputStyle} />
                </Campo>

                <Campo label="Plazo (días hábiles)">
                  <input type="number" min={1} value={datos.plazo_dias_habiles} onChange={e => setDatos({ ...datos, plazo_dias_habiles: parseInt(e.target.value) || 20 })} style={inputStyle} />
                </Campo>

                <Campo label="Título" fullWidth>
                  <input value={datos.titulo} onChange={e => setDatos({ ...datos, titulo: e.target.value })} style={inputStyle} />
                </Campo>

                <Campo label="Resumen (generado por IA)" fullWidth>
                  <textarea value={datos.resumen} onChange={e => setDatos({ ...datos, resumen: e.target.value })}
                    rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                </Campo>

              </div>
            </div>

            {/* Tareas sugeridas */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3 style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                  Tareas sugeridas ({tareas.length})
                </h3>
                <button onClick={() => setTareas([...tareas, { numero: tareas.length + 1, descripcion: '', area_responsable: '', dias_planeados: 5 }])}
                  style={{ background: 'rgba(234,171,0,0.1)', color: '#EAAB00', border: '1px solid rgba(234,171,0,0.2)', borderRadius: '6px', padding: '0.3rem 0.75rem', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
                  + Agregar
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {tareas.map((t, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 80px 32px', gap: '0.5rem', alignItems: 'start' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(234,171,0,0.1)', color: '#EAAB00', fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px' }}>
                      {i + 1}
                    </div>
                    <input
                      value={t.descripcion}
                      placeholder="Descripción de la tarea"
                      onChange={e => setTareas(tareas.map((x, j) => j === i ? { ...x, descripcion: e.target.value } : x))}
                      style={{ ...inputStyle, fontSize: '0.8rem' }}
                    />
                    <input
                      value={t.area_responsable}
                      placeholder="Área responsable"
                      onChange={e => setTareas(tareas.map((x, j) => j === i ? { ...x, area_responsable: e.target.value } : x))}
                      style={{ ...inputStyle, fontSize: '0.8rem' }}
                    />
                    <input
                      type="number" min={1} value={t.dias_planeados}
                      onChange={e => setTareas(tareas.map((x, j) => j === i ? { ...x, dias_planeados: parseInt(e.target.value) || 1 } : x))}
                      style={{ ...inputStyle, fontSize: '0.8rem', textAlign: 'center' }}
                    />
                    <button onClick={() => setTareas(tareas.filter((_, j) => j !== i))}
                      style={{ background: 'none', border: 'none', color: 'rgba(239,68,68,0.5)', cursor: 'pointer', padding: '6px', borderRadius: '6px', marginTop: '2px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Acciones */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => { setFase('upload'); setDatos(null); setTareas([]); }}
                style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.65rem 1.5rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={guardarOficio}
                style={{ background: 'rgba(234,171,0,0.15)', color: '#EAAB00', border: '1px solid rgba(234,171,0,0.35)', borderRadius: '10px', padding: '0.65rem 1.75rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Registrar oficio
              </button>
            </div>
          </motion.div>
        )}

        {/* ── FASE: Guardando ── */}
        {fase === 'guardando' && (
          <motion.div key="guardando" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px', padding: '4rem 2rem', textAlign: 'center' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              style={{ width: '48px', height: '48px', margin: '0 auto 1.5rem', border: '3px solid rgba(16,185,129,0.2)', borderTopColor: '#10B981', borderRadius: '50%' }} />
            <p style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', margin: 0 }}>Guardando oficio…</p>
          </motion.div>
        )}

        {/* ── FASE: Listo ── */}
        {fase === 'listo' && (
          <motion.div key="listo" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '18px', padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
            <p style={{ color: '#10B981', fontWeight: 800, fontSize: '1.1rem', margin: '0 0 0.4rem' }}>Oficio registrado</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', margin: 0 }}>Redirigiendo al detalle…</p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────
function Campo({ label, children, fullWidth }: { label: string; children: React.ReactNode; fullWidth?: boolean }) {
  return (
    <div style={{ gridColumn: fullWidth ? '1 / -1' : undefined, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <label style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  padding: '0.55rem 0.75rem',
  color: '#fff',
  fontSize: '0.85rem',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};
