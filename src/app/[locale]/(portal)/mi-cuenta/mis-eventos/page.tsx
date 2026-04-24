'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';

// Mock data based on the schema
const mockEvents = [
  {
    id: '1',
    titulo: 'Congreso Anual de Inversiones 2026',
    fecha: '2026-11-12T10:00:00Z',
    ubicacion: 'Hotel Camino Real, Polanco',
    qr_code: 'AMIB-CONGRESO-2026-HASH-123',
    modalidad: 'Presencial',
    tipo_acceso: 'pago',
    asistio: false
  },
  {
    id: '2',
    titulo: 'Webinar: Estrategias de Mercado Q4',
    fecha: '2026-12-05T17:00:00Z',
    ubicacion: 'Zoom Video Communications',
    qr_code: 'AMIB-WEBINAR-Q4-HASH-456',
    modalidad: 'Virtual',
    tipo_acceso: 'libre',
    asistio: false
  }
];

export default function MisEventosPage() {
  const { locale } = useParams();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // Design tokens
  const card = { 
    background: 'rgba(255,255,255,0.04)', 
    borderRadius: '24px', 
    border: '1px solid rgba(255,255,255,0.08)', 
    padding: '1.5rem',
    backdropFilter: 'blur(10px)',
    cursor: 'pointer',
    transition: 'all 0.3s'
  };
  const gold = 'var(--color-secondary-container, #EAAB00)';
  const text = 'rgba(255,255,255,0.9)';
  const muted = 'rgba(255,255,255,0.5)';

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '3rem' }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>Mis Inscripciones</h1>
          <p style={{ color: muted, fontSize: '1.1rem' }}>Gestiona tus accesos, códigos QR y constancias de asistencia.</p>
        </motion.div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        {mockEvents.map((event, idx) => (
          <motion.div 
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.01, background: 'rgba(255,255,255,0.06)' }}
            style={card}
            onClick={() => setSelectedEvent(event)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <div style={{ background: 'rgba(234,171,0,0.1)', color: gold, padding: '1rem', borderRadius: '16px', textAlign: 'center', minWidth: '70px' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>
                    {new Date(event.fecha).toLocaleDateString('es-MX', { month: 'short' })}
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>
                    {new Date(event.fecha).toLocaleDateString('es-MX', { day: 'numeric' })}
                  </div>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'white', marginBottom: '0.4rem' }}>{event.titulo}</h3>
                  <div style={{ display: 'flex', gap: '1.5rem', color: muted, fontSize: '0.85rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>📍 {event.ubicacion}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>💻 {event.modalidad}</span>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ background: gold, color: '#060e1c', padding: '0.5rem 1.25rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.8rem' }}>
                  Ver Boleto QR
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal for QR Code */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
              background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
              zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '2rem'
            }}
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{ 
                background: 'white', borderRadius: '32px', width: '100%', maxWidth: '400px',
                padding: '3rem', color: '#060e1c', textAlign: 'center', position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedEvent(null)}
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#cbd5e1' }}
              >
                ×
              </button>
              
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Acceso Confirmado</div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>{selectedEvent.titulo}</h2>
              </div>

              <div style={{ 
                background: '#f8fafc', padding: '2rem', borderRadius: '24px', 
                border: '1px solid #e2e8f0', marginBottom: '2rem',
                display: 'flex', justifyContent: 'center'
              }}>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(selectedEvent.qr_code)}`} 
                  alt="QR Access"
                  style={{ width: '200px', height: '200px' }}
                />
              </div>

              <div style={{ textAlign: 'left', display: 'grid', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Fecha y Hora</div>
                  <div style={{ fontWeight: 600, color: '#334155' }}>
                    {new Date(selectedEvent.fecha).toLocaleString('es-MX', { dateStyle: 'full', timeStyle: 'short' })}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Ubicación</div>
                  <div style={{ fontWeight: 600, color: '#334155' }}>{selectedEvent.ubicacion}</div>
                </div>
              </div>

              <button 
                style={{ width: '100%', marginTop: '2.5rem', background: '#0f172a', color: 'white', border: 'none', padding: '1.1rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
                onClick={() => window.print()}
              >
                Imprimir / Guardar PDF
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
