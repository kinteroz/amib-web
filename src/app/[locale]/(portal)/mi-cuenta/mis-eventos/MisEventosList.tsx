'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { QrImage } from '@/components/ui/events/QrImage';

export interface RegistroEvento {
  id: string;
  nombre_completo: string | null;
  email: string | null;
  qr_code: string;
  asistio: boolean;
  fecha_checkin: string | null;
  fecha_registro: string;
  evento: {
    id: string;
    titulo: string;
    slug: string | null;
    fecha_inicio: string;
    ubicacion: string | null;
    modalidad: string | null;
    tipo_acceso: string | null;
  };
}

const MODALIDAD_LABEL: Record<string, string> = {
  presencial: 'Presencial',
  virtual: 'Virtual',
  hibrido: 'Híbrido',
};

export function MisEventosList({ registros, locale }: { registros: RegistroEvento[]; locale: string }) {
  const [selected, setSelected] = useState<RegistroEvento | null>(null);

  const card: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    borderRadius: '24px',
    border: '1px solid rgba(255,255,255,0.08)',
    padding: '1.5rem',
    backdropFilter: 'blur(10px)',
    cursor: 'pointer',
    transition: 'all 0.3s',
  };
  const gold = 'var(--color-secondary-container, #EAAB00)';
  const muted = 'rgba(255,255,255,0.5)';

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '3rem' }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>Mis Inscripciones</h1>
          <p style={{ color: muted, fontSize: '1.1rem' }}>Gestiona tus accesos, códigos QR y constancias de asistencia.</p>
        </motion.div>
      </div>

      {registros.length === 0 ? (
        <div style={{ ...card, cursor: 'default', textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎟️</div>
          <p style={{ color: 'white', fontWeight: 700, marginBottom: '0.5rem' }}>Aún no tienes inscripciones.</p>
          <p style={{ color: muted, marginBottom: '1.5rem' }}>Explora los próximos eventos institucionales y registra tu lugar.</p>
          <Link href={`/${locale}/noticias`} style={{ color: gold, fontWeight: 700, textDecoration: 'none' }}>
            Ver eventos →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          {registros.map((registro, idx) => (
            <motion.div
              key={registro.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.01, background: 'rgba(255,255,255,0.06)' }}
              style={card}
              onClick={() => setSelected(registro)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                  <div style={{ background: 'rgba(234,171,0,0.1)', color: gold, padding: '1rem', borderRadius: '16px', textAlign: 'center', minWidth: '70px' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>
                      {new Date(registro.evento.fecha_inicio).toLocaleDateString('es-MX', { month: 'short' })}
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>
                      {new Date(registro.evento.fecha_inicio).toLocaleDateString('es-MX', { day: 'numeric' })}
                    </div>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'white', marginBottom: '0.4rem' }}>{registro.evento.titulo}</h3>
                    <div style={{ display: 'flex', gap: '1.5rem', color: muted, fontSize: '0.85rem', flexWrap: 'wrap' }}>
                      {registro.evento.ubicacion && <span>📍 {registro.evento.ubicacion}</span>}
                      {registro.evento.modalidad && <span>💻 {MODALIDAD_LABEL[registro.evento.modalidad] ?? registro.evento.modalidad}</span>}
                      {registro.asistio && <span style={{ color: '#10B981', fontWeight: 700 }}>✓ Asistencia registrada</span>}
                    </div>
                  </div>
                </div>
                <div style={{ background: gold, color: '#060e1c', padding: '0.5rem 1.25rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.8rem' }}>
                  Ver Boleto QR
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal del boleto */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
              zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '2rem',
            }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: 'white', borderRadius: '32px', width: '100%', maxWidth: '400px',
                padding: '3rem', color: '#060e1c', textAlign: 'center', position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelected(null)}
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#cbd5e1' }}
              >
                ×
              </button>

              <div style={{ marginBottom: '2rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                  {selected.asistio ? 'Asistencia Confirmada' : 'Acceso Confirmado'}
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>{selected.evento.titulo}</h2>
              </div>

              <div style={{
                background: '#f8fafc', padding: '2rem', borderRadius: '24px',
                border: '1px solid #e2e8f0', marginBottom: '2rem',
                display: 'flex', justifyContent: 'center',
              }}>
                <QrImage value={selected.qr_code} size={200} />
              </div>

              <div style={{ textAlign: 'left', display: 'grid', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Asistente</div>
                  <div style={{ fontWeight: 600, color: '#334155' }}>{selected.nombre_completo}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Fecha y Hora</div>
                  <div style={{ fontWeight: 600, color: '#334155' }}>
                    {new Date(selected.evento.fecha_inicio).toLocaleString('es-MX', { dateStyle: 'full', timeStyle: 'short' })}
                  </div>
                </div>
                {selected.evento.ubicacion && (
                  <div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Ubicación</div>
                    <div style={{ fontWeight: 600, color: '#334155' }}>{selected.evento.ubicacion}</div>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gap: '0.75rem', marginTop: '2.5rem' }}>
                {selected.asistio && (
                  <Link
                    href={`/${locale}/constancia/${selected.id}`}
                    style={{ display: 'block', textAlign: 'center', background: '#EAAB00', color: '#060e1c', padding: '1.1rem', borderRadius: '12px', fontWeight: 700, textDecoration: 'none' }}
                  >
                    🎓 Ver Constancia de Asistencia
                  </Link>
                )}
                <button
                  style={{ width: '100%', background: '#0f172a', color: 'white', border: 'none', padding: '1.1rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
                  onClick={() => window.print()}
                >
                  Imprimir / Guardar PDF
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
