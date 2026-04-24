'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { Database } from '@/types/database.types';
import styles from '@/components/ui/animations/animations.module.css';

type Evento = Database['public']['Tables']['eventos']['Row'];

interface InstitutionalCalendarProps {
  eventos: Evento[];
}

export function InstitutionalCalendar({ eventos }: InstitutionalCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    const upcomingEvent = eventos.find(e => new Date(e.fecha_inicio) >= now);
    if (upcomingEvent) {
      const eDate = new Date(upcomingEvent.fecha_inicio);
      return new Date(eDate.getFullYear(), eDate.getMonth(), 1);
    }
    return now;
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Current month events for the calendar grid
  const currentMonthEvents = useMemo(() => eventos.filter(evento => {
    const eDate = new Date(evento.fecha_inicio);
    return eDate.getMonth() === month && eDate.getFullYear() === year;
  }), [eventos, month, year]);

  // Global upcoming events for the sidebar
  const upcomingGlobalEvents = useMemo(() => {
    const now = new Date();
    return eventos
      .filter(e => new Date(e.fecha_inicio) >= now)
      .sort((a, b) => new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime())
      .slice(0, 4);
  }, [eventos]);

  const getEventForDay = (day: number) => {
    return currentMonthEvents.find(e => new Date(e.fecha_inicio).getDate() === day);
  };

  return (
    <div className={styles.calendarResponsiveGrid}>
      
      {/* Calendar Grid Container */}
      <div className={styles.premiumCard} style={{ 
        borderRadius: '24px', 
        padding: '1.5rem 2rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
              {monthNames[month]}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600 }}>Citas Institucionales {year}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={prevMonth} 
              style={{ padding: '0.5rem 0.8rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', cursor: 'pointer', color: 'white', fontSize: '0.85rem' }}
            >
              ←
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={nextMonth} 
              style={{ padding: '0.5rem 0.8rem', background: 'var(--color-secondary-container)', border: 'none', borderRadius: '10px', cursor: 'pointer', color: 'var(--color-primary)', fontSize: '0.85rem' }}
            >
              →
            </motion.button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.35rem', textAlign: 'center' }}>
          {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => (
            <div key={`${d}-${i}`} style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 700, paddingBottom: '0.5rem' }}>{d}</div>
          ))}
          
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const evento = getEventForDay(day);
            const isHighlighted = !!evento;
            
            const dayCell = (
              <motion.div 
                  whileHover={isHighlighted ? { scale: 1.15 } : {}}
                  style={{ 
                    aspectRatio: '1', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    borderRadius: '10px',
                    fontWeight: isHighlighted ? 800 : 500,
                    fontSize: '0.85rem',
                    cursor: isHighlighted ? 'pointer' : 'default',
                    background: isHighlighted ? 'var(--color-secondary-container)' : 'transparent',
                    color: isHighlighted ? 'var(--color-primary-container)' : 'rgba(255,255,255,0.8)',
                    position: 'relative',
                    border: isHighlighted ? 'none' : '1px solid rgba(255,255,255,0.06)'
                  }}
              >
                  {day}
              </motion.div>
            );

            return isHighlighted ? (
              <Link key={day} href={`/eventos/${evento!.id}`} style={{ textDecoration: 'none' }}>
                {dayCell}
              </Link>
            ) : (
              <React.Fragment key={day}>{dayCell}</React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Sidebar: Upcoming Events List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'white' }}>Próximos</h4>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.3rem 0.6rem', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Agenda
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
          {upcomingGlobalEvents.map((evento, i) => {
            const eDate = new Date(evento.fecha_inicio);
            const isDifferentMonth = eDate.getMonth() !== month;
            
            return (
              <React.Fragment key={evento.id}>
                {isDifferentMonth && (i === 0 || new Date(upcomingGlobalEvents[i-1].fecha_inicio).getMonth() !== eDate.getMonth()) && (
                  <div style={{ 
                    padding: '0.3rem 0', 
                    fontSize: '0.6rem', 
                    fontWeight: 800, 
                    color: 'var(--color-secondary-container)', 
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    marginTop: i === 0 ? 0 : '0.5rem'
                  }}>
                    {monthNames[eDate.getMonth()]} {eDate.getFullYear()}
                  </div>
                )}
                
                <Link key={evento.id} href={`/eventos/${evento.id}`} style={{ textDecoration: 'none' }}>
                  <motion.div 
                    className={styles.premiumCard}
                    whileHover={{ x: 6 }}
                    style={{ 
                      display: 'flex', 
                      gap: '1rem', 
                      padding: '1rem', 
                      borderRadius: '16px',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ textAlign: 'center', minWidth: '44px' }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'white', lineHeight: 0.9 }}>{eDate.getDate()}</div>
                      <div style={{ fontSize: '0.55rem', textTransform: 'uppercase', color: 'var(--color-secondary-container)', fontWeight: 800, marginTop: '3px' }}>{monthNames[eDate.getMonth()].substring(0, 3)}</div>
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h5 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'white', marginBottom: '0.3rem', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{evento.titulo}</h5>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>📍 {evento.ubicacion || 'CDMX'}</span>
                        <span style={{ 
                          fontSize: '0.55rem', 
                          fontWeight: 700, 
                          padding: '0.15rem 0.5rem', 
                          borderRadius: '5px', 
                          background: evento.tipo_acceso === 'libre' ? 'var(--color-success-container, #dcfce7)' : 'var(--color-secondary-container)',
                          color: evento.tipo_acceso === 'libre' ? 'var(--color-success, #166534)' : 'var(--color-primary)'
                        }}>
                          {evento.tipo_acceso === 'libre' ? 'LIBRE' : evento.tipo_acceso === 'pago' ? 'CON COSTO' : 'INVITACIÓN'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </React.Fragment>
            );
          })}
        </div>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{ 
            padding: '0.8rem', 
            background: 'var(--color-primary-container)', 
            color: 'white', 
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '0.85rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 8px 16px rgba(0, 20, 45, 0.2)'
          }}
        >
          Ver Agenda Completa
        </motion.button>
      </div>

    </div>
  );
}
