'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';

const mockExamenes = [
  {
    id: '1',
    titulo: 'Examen de Certificación AEI (Nivel 3)',
    fecha: '2026-11-20',
    hora: '09:00 AM',
    modalidad: 'Presencial',
    sede: 'Sede AMIB CDMX - Reforma',
    cupo: 12,
    total: 30,
    costo: '$4,500 MXN'
  },
  {
    id: '2',
    titulo: 'Examen para Operador de Bolsa (Nivel 2)',
    fecha: '2026-11-25',
    hora: '10:00 AM',
    modalidad: 'Distancia',
    sede: 'Plataforma Virtual AMIB',
    cupo: 5,
    total: 50,
    costo: '$3,800 MXN'
  },
  {
    id: '3',
    titulo: 'Examen de Actualización para Asesores',
    fecha: '2026-12-02',
    hora: '04:00 PM',
    modalidad: 'Presencial',
    sede: 'Sede AMIB Monterrey',
    cupo: 25,
    total: 25,
    costo: '$2,900 MXN'
  }
];

export default function ExamenesPage() {
  const { locale } = useParams();

  // Design tokens
  const card = { 
    background: 'rgba(255,255,255,0.04)', 
    borderRadius: '24px', 
    border: '1px solid rgba(255,255,255,0.08)', 
    padding: '2rem',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s'
  };
  const gold = 'var(--color-secondary-container, #EAAB00)';
  const text = 'rgba(255,255,255,0.9)';
  const muted = 'rgba(255,255,255,0.5)';

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '3rem' }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>Exámenes de Certificación</h1>
          <p style={{ color: muted, fontSize: '1.1rem' }}>Calendario oficial de aplicación y registro para figuras certificadas.</p>
        </motion.div>
      </div>

      <div style={{ display: 'grid', gap: '2rem' }}>
        {mockExamenes.map((examen, idx) => (
          <motion.div 
            key={examen.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            style={card}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'center' }}>
              
              <div>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                  <span style={{ 
                    background: examen.modalidad === 'Presencial' ? 'rgba(56, 189, 248, 0.1)' : 'rgba(168, 85, 247, 0.1)', 
                    color: examen.modalidad === 'Presencial' ? '#38bdf8' : '#a855f7',
                    fontSize: '0.7rem', fontWeight: 800, padding: '0.3rem 0.75rem', borderRadius: '100px',
                    border: `1px solid ${examen.modalidad === 'Presencial' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(168, 85, 247, 0.2)'}`
                  }}>
                    {examen.modalidad.toUpperCase()}
                  </span>
                  <span style={{ color: gold, fontSize: '0.85rem', fontWeight: 700 }}>📅 {examen.fecha}</span>
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', marginBottom: '0.75rem' }}>{examen.titulo}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: muted, fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>📍 {examen.sede}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🕒 Inicio: {examen.hora}</div>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: muted, marginBottom: '0.5rem' }}>Disponibilidad</div>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '0.3rem' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 900, color: examen.cupo > 0 ? '#4ade80' : '#ef4444', lineHeight: 1 }}>{examen.cupo}</span>
                    <span style={{ fontSize: '1rem', color: muted, fontWeight: 600, marginBottom: '0.2rem' }}>/ {examen.total} Lugares</span>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>
                   {examen.costo}
                </div>

                <button 
                  disabled={examen.cupo === 0}
                  style={{ 
                    width: '100%', padding: '1rem', borderRadius: '12px', border: 'none', 
                    background: examen.cupo > 0 ? gold : 'rgba(255,255,255,0.1)', 
                    color: examen.cupo > 0 ? '#060e1c' : muted, 
                    fontWeight: 800, cursor: examen.cupo > 0 ? 'pointer' : 'not-allowed',
                    fontSize: '0.9rem'
                  }}
                >
                  {examen.cupo > 0 ? 'Iniciar Registro' : 'Lista de Espera'}
                </button>
              </div>

            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ marginTop: '4rem', padding: '2rem', background: 'rgba(234,171,0,0.05)', borderRadius: '24px', border: '1px solid rgba(234,171,0,0.1)', display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <div style={{ fontSize: '2.5rem' }}>💡</div>
        <div>
          <h4 style={{ color: gold, fontWeight: 800, marginBottom: '0.25rem' }}>¿Necesitas una fecha especial?</h4>
          <p style={{ color: muted, fontSize: '0.9rem' }}>Para grupos institucionales de más de 15 personas, podemos coordinar aplicaciones en fechas privadas. <span style={{ color: 'white', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>Contactar a Certificación AMIB</span></p>
        </div>
      </div>
    </div>
  );
}
