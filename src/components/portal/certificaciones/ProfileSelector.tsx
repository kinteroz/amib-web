'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const PROFILES = [
  {
    id: 'independiente',
    icono: '👤',
    titulo: 'Candidato independiente',
    descripcion: 'Certifícate por tu cuenta sin depender de una institución financiera.',
    href: '/certificaciones/independientes',
    cta: 'Ver proceso →',
    acento: '#C9A84C',
    tags: ['Figuras 1, 2 y 3', 'Persona física'],
  },
  {
    id: 'institucion',
    icono: '🏛️',
    titulo: 'Mi institución',
    descripcion: 'Gestiona la certificación y autorización CNBV del personal de tu Casa de Bolsa u Operadora.',
    href: '/certificaciones/instituciones',
    cta: 'Ver proceso →',
    acento: '#3B82F6',
    tags: ['Casas de Bolsa', 'Operadoras', 'CNBV'],
  },
  {
    id: 'padron',
    icono: '🔍',
    titulo: 'Consultar padrón',
    descripcion: 'Verifica si una persona cuenta con certificación AMIB vigente.',
    href: '/certificaciones/padron',
    cta: 'Buscar →',
    acento: '#10B981',
    tags: ['Búsqueda pública', 'Verificación'],
  },
] as const;

export function ProfileSelector() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '1.5rem',
      width: '100%',
    }}>
      {PROFILES.map((p) => {
        const isHovered = hovered === p.id;
        return (
          <Link
            key={p.id}
            href={p.href}
            onMouseEnter={() => setHovered(p.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '2.5rem',
              borderRadius: '20px',
              background: isHovered
                ? `linear-gradient(135deg, ${p.acento}18 0%, rgba(255,255,255,0.04) 100%)`
                : 'rgba(255,255,255,0.03)',
              border: `1px solid ${isHovered ? p.acento + '60' : 'rgba(255,255,255,0.07)'}`,
              boxShadow: isHovered
                ? `0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px ${p.acento}30`
                : '0 4px 20px rgba(0,0,0,0.15)',
              transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
              transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
              textDecoration: 'none',
              backdropFilter: 'blur(16px)',
              cursor: 'pointer',
            }}
          >
            <div style={{
              fontSize: '2.5rem',
              marginBottom: '1.5rem',
              width: '64px',
              height: '64px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `${p.acento}15`,
              borderRadius: '16px',
              border: `1px solid ${p.acento}30`,
              transition: 'all 0.3s ease',
              transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            }}>
              {p.icono}
            </div>

            <h3 style={{
              fontSize: '1.3rem',
              fontWeight: 700,
              color: 'white',
              marginBottom: '0.75rem',
              lineHeight: 1.2,
            }}>
              {p.titulo}
            </h3>

            <p style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              flex: 1,
              marginBottom: '1.5rem',
            }}>
              {p.descripcion}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {p.tags.map(tag => (
                <span key={tag} style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '6px',
                  background: `${p.acento}15`,
                  color: p.acento,
                  border: `1px solid ${p.acento}30`,
                }}>
                  {tag}
                </span>
              ))}
            </div>

            <div style={{
              color: p.acento,
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'gap 0.2s ease',
            }}>
              {p.cta}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
