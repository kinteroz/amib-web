'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';

export default function ProfessorDashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulamos carga de datos
    setTimeout(() => setLoading(false), 800);
  }, []);

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ 
          background: 'linear-gradient(100deg, #001F3F 0%, #002d5a 100%)',
          borderRadius: '30px',
          padding: '3.5rem',
          marginBottom: '2.5rem',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '600px' }}>
          <div style={{ color: '#EAAB00', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
            Ciclo Escolar Activo
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', marginBottom: '1.5rem', lineHeight: 1.1 }}>
            Hola, Profesor.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            Bienvenido a su centro de mando académico. Aquí puede gestionar sus cátedras, interactuar con sus alumnos y dar seguimiento a sus evaluaciones vigentes.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button style={{ background: '#EAAB00', color: '#001F3F', border: 'none', padding: '1rem 2rem', borderRadius: '12px', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', transition: 'transform 0.2s' }}>
              Iniciar Pase de Lista
            </button>
            <button style={{ background: 'rgba(255,255,255,0.06)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', padding: '1rem 2rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', backdropFilter: 'blur(10px)' }}>
              Ver Mis Cátedras →
            </button>
          </div>
        </div>
        
        {/* Abstract Background Element */}
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(234,171,0,0.1) 0%, transparent 70%)', borderRadius: '50%' }}></div>
      </motion.section>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        <MetricCard 
          label="ALUMNOS ACTIVOS" 
          value="142" 
          total="/ 150" 
          sub="8 alumnos registrados hoy"
          color="#EAAB00"
          icon="👥"
        />
        <MetricCard 
          label="CÁTEDRAS VIGENTES" 
          value="4" 
          sub="Próxima sesión en 2 horas"
          color="#38bdf8"
          icon="📚"
        />
        <MetricCard 
          label="VIGENCIA DOCENTE" 
          value="Dic 2026" 
          sub="Contrato Administrativo Activo"
          color="#10b981"
          icon="⏳"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2.5rem' }}>
        {/* Próximas Sesiones */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', letterSpacing: '-0.01em' }}>Próximas Sesiones AMIB</h2>
            <button style={{ background: 'transparent', border: 'none', color: '#EAAB00', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>Ver Todas →</button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <SessionRow 
              day="29" 
              month="ABR" 
              title="Mercado de Valores y Derivados" 
              type="Presencial" 
              status="En Curso"
              color="#EAAB00"
            />
            <SessionRow 
              day="30" 
              month="ABR" 
              title="Ética Financiera y Cumplimiento" 
              type="Virtual" 
              status="Programada"
              color="#38bdf8"
            />
          </div>
        </section>

        {/* Lado Derecho: Actividad Reciente */}
        <section>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '2rem', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <div style={{ width: '40px', height: '40px', background: 'rgba(234,171,0,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EAAB00' }}>
                📊
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Actividad Académica</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <ActivityItem 
                category="Tareas" 
                title="Evaluación 2: Análisis de Riesgos" 
                points="+42 entregas" 
                status="Por Calificar"
              />
              <ActivityItem 
                category="Material" 
                title="Presentación: Derivados Avanzados" 
                points="12 descargas" 
                status="Publicado"
              />
              <ActivityItem 
                category="Examen" 
                title="Examen Parcial de Ética" 
                points="Pendiente" 
                status="Programado"
              />
            </div>

            <button style={{ 
              width: '100%', 
              marginTop: '2.5rem', 
              padding: '1rem', 
              background: 'transparent', 
              border: '1px solid rgba(255,255,255,0.1)', 
              borderRadius: '14px', 
              color: '#EAAB00', 
              fontWeight: 700, 
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}>
              Ver Centro de Calificaciones →
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricCard({ label, value, total, sub, color, icon }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5, background: 'rgba(255,255,255,0.05)' }}
      style={{ 
        background: 'rgba(255,255,255,0.03)', 
        border: '1px solid rgba(255,255,255,0.06)', 
        borderRadius: '24px', 
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ color: '#EAAB00', fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '2.25rem', fontWeight: 800 }}>{value}</span>
        {total && <span style={{ fontSize: '1.1rem', opacity: 0.3, fontWeight: 600 }}>{total}</span>}
      </div>
      <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginBottom: '1rem', overflow: 'hidden' }}>
         <div style={{ width: '75%', height: '100%', background: color, boxShadow: `0 0 10px ${color}` }}></div>
      </div>
      <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{sub}</p>
      
      <div style={{ position: 'absolute', top: '2rem', right: '2rem', opacity: 0.1, fontSize: '2.5rem' }}>
        {icon}
      </div>
    </motion.div>
  );
}

function SessionRow({ day, month, title, type, status, color }: any) {
  return (
    <motion.div 
      whileHover={{ scale: 1.01, background: 'rgba(255,255,255,0.05)' }}
      style={{ 
        background: 'rgba(255,255,255,0.03)', 
        border: '1px solid rgba(255,255,255,0.06)', 
        borderRadius: '20px', 
        padding: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        cursor: 'pointer'
      }}
    >
      <div style={{ textAlign: 'center', minWidth: '60px', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: color }}>{month}</div>
        <div style={{ fontSize: '1.25rem', fontWeight: 900 }}>{day}</div>
      </div>
      
      <div style={{ flex: 1 }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>{title}</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem' }}>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>{type}</span>
          <span style={{ color: color, fontWeight: 700 }}>✓ {status}</span>
        </div>
      </div>
      
      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
        →
      </div>
    </motion.div>
  );
}

function ActivityItem({ category, title, points, status }: any) {
  return (
    <div>
      <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 800, color: '#EAAB00', opacity: 0.8, marginBottom: '0.5rem' }}>
        {category}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', maxWidth: '180px', lineHeight: 1.3 }}>{title}</div>
        <div style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 700 }}>{points}</div>
      </div>
      <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
        {status}
      </div>
    </div>
  );
}
