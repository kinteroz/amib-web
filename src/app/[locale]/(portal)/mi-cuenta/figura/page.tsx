'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import styles from '@/components/portal/portal.module.css';

export default function MiFiguraPage() {
  const { locale } = useParams();

  // Design tokens
  const card = { 
    background: 'rgba(255,255,255,0.04)', 
    borderRadius: '24px', 
    border: '1px solid rgba(255,255,255,0.08)', 
    padding: '2rem',
    backdropFilter: 'blur(10px)'
  };
  const gold = 'var(--color-secondary-container, #EAAB00)';
  const text = 'rgba(255,255,255,0.9)';
  const muted = 'rgba(255,255,255,0.5)';

  const requisitos = [
    { nombre: 'Puntos de Ética', actual: 15, meta: 20, status: 'progreso' },
    { nombre: 'Puntos Técnicos', actual: 80, meta: 100, status: 'progreso' },
    { nombre: 'Puntos de Actualización', actual: 25, meta: 30, status: 'progreso' },
  ];

  const historial = [
    { fecha: '12 Mar 2024', evento: 'Congreso Anual de Inversiones', puntos: '+15 Pts', tipo: 'Técnico' },
    { fecha: '05 Feb 2024', evento: 'Curso de Ética Nivel 2', puntos: '+10 Pts', tipo: 'Ética' },
    { fecha: '15 Ene 2024', evento: 'Seminario Derivados', puntos: '+20 Pts', tipo: 'Técnico' },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Area */}
      <div style={{ marginBottom: '3rem' }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>Estatus de mi Figura</h1>
          <p style={{ color: muted, fontSize: '1.1rem' }}>Detalles técnicos y progreso de renovación para tu certificación AMIB.</p>
        </motion.div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2.5rem' }}>
        
        {/* Left Column: Details & Progress */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          {/* Main Figure Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: gold, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem', display: 'block' }}>FIGURA VIGENTE</span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white' }}>Asesor en Estrategias de Inversión</h2>
                <p style={{ color: muted, marginTop: '0.25rem' }}>Código de Certificación: <span style={{ color: text, fontWeight: 600 }}>AMIB-AEI-99283</span></p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', padding: '0.4rem 1rem', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 700, border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                  ACTIVA
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', padding: '2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: muted, textTransform: 'uppercase', marginBottom: '0.4rem' }}>Fecha de Expedición</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'white' }}>15 Octubre 2024</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: muted, textTransform: 'uppercase', marginBottom: '0.4rem' }}>Fecha de Vencimiento</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: gold }}>15 Octubre 2027</div>
              </div>
            </div>
          </motion.div>

          {/* Points Breakdown */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={card}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', marginBottom: '2rem' }}>Desglose de Requisitos</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {requisitos.map((req, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: text }}>{req.nombre}</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: gold }}>{req.actual} / {req.meta} Pts</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${(req.actual / req.meta) * 100}%` }}
                      transition={{ duration: 1, delay: 0.3 + idx * 0.1 }}
                      style={{ height: '100%', background: gold, borderRadius: '4px' }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>

        {/* Right Column: Actions & History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          {/* Quick Actions Card */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={card}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', marginBottom: '1.5rem' }}>Documentación</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button style={{ background: 'rgba(255,255,255,0.06)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '12px', fontWeight: 600, textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span>📜</span> Descargar Título Digital (PDF)
              </button>
              <button style={{ background: 'rgba(255,255,255,0.06)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '12px', fontWeight: 600, textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span>💳</span> Exportar Credencial Digital
              </button>
              <button style={{ background: 'rgba(234,171,0,0.1)', color: gold, border: `1px solid ${gold}`, padding: '1rem', borderRadius: '12px', fontWeight: 700, textAlign: 'center', cursor: 'pointer', marginTop: '1rem' }}>
                Solicitar Renovación Anticipada
              </button>
            </div>
          </motion.div>

          {/* Historial de Puntos */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} style={{ ...card, padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', marginBottom: '1.5rem' }}>Historial de Puntaje</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {historial.map((item, idx) => (
                <div key={idx} style={{ paddingBottom: '1.25rem', borderBottom: idx < historial.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: text }}>{item.evento}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#4ade80' }}>{item.puntos}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', color: muted }}>{item.fecha}</span>
                    <span style={{ fontSize: '0.7rem', color: gold, textTransform: 'uppercase', fontWeight: 700 }}>{item.tipo}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>

      </div>
    </div>
  );
}
