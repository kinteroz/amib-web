'use client';

import React, { useState, useMemo } from 'react';
import { Database } from '@/types/database.types';

type Documento = Database['public']['Tables']['documentos_cert']['Row'];

const CATEGORIAS: { value: Documento['categoria'] | 'all'; label: string }[] = [
  { value: 'all',         label: 'Todos' },
  { value: 'guia',        label: 'Guías' },
  { value: 'manual',      label: 'Manuales' },
  { value: 'formato',     label: 'Formatos' },
  { value: 'comunicado',  label: 'Comunicados' },
  { value: 'tarifa',      label: 'Tarifas' },
  { value: 'reglamento',  label: 'Reglamentos' },
];

const PERFILES: { value: Documento['tipo_perfil'] | 'all'; label: string }[] = [
  { value: 'all',           label: 'Todos los perfiles' },
  { value: 'independiente', label: 'Independiente' },
  { value: 'institucion',   label: 'Institucional' },
  { value: 'consar',        label: 'CONSAR' },
  { value: 'general',       label: 'General' },
];

const CATEGORIA_ICONS: Record<string, string> = {
  guia:       '📖',
  manual:     '📗',
  formato:    '📄',
  comunicado: '📢',
  tarifa:     '💰',
  reglamento: '⚖️',
  otro:       '📎',
};

interface DocumentLibraryProps {
  documentos: Documento[];
  emptyMessage?: string;
}

export function DocumentLibrary({ documentos, emptyMessage }: DocumentLibraryProps) {
  const [categoria, setCategoria] = useState<string>('all');
  const [perfil, setPerfil]       = useState<string>('all');
  const [query, setQuery]         = useState('');

  const filtered = useMemo(() => {
    return documentos.filter(d => {
      const matchCat    = categoria === 'all' || d.categoria === categoria;
      const matchPerfil = perfil === 'all' || d.tipo_perfil === perfil;
      const matchQuery  = !query || d.titulo.toLowerCase().includes(query.toLowerCase()) ||
                          (d.descripcion || '').toLowerCase().includes(query.toLowerCase());
      return matchCat && matchPerfil && matchQuery;
    });
  }, [documentos, categoria, perfil, query]);

  const isEmpty = documentos.length === 0;

  return (
    <div>
      {/* Controles */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem',
        alignItems: 'center',
      }}>
        {/* Búsqueda */}
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <span style={{
            position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
            color: 'rgba(255,255,255,0.3)', fontSize: '1rem',
          }}>🔍</span>
          <input
            type="text"
            placeholder="Buscar documento..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.75rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              color: 'white',
              fontSize: '0.9rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Filtro perfil */}
        <select
          value={perfil}
          onChange={e => setPerfil(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            color: 'white',
            fontSize: '0.85rem',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          {PERFILES.map(p => (
            <option key={p.value} value={p.value} style={{ background: '#001426' }}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* Tabs de categoría */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap',
        marginBottom: '2rem',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        paddingBottom: '1rem',
      }}>
        {CATEGORIAS.map(c => (
          <button
            key={c.value}
            onClick={() => setCategoria(c.value)}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: categoria === c.value ? 'var(--color-secondary-container)' : 'rgba(255,255,255,0.1)',
              background: categoria === c.value ? 'var(--color-secondary-container)' : 'transparent',
              color: categoria === c.value ? 'var(--color-primary)' : 'rgba(255,255,255,0.6)',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Estado vacío */}
      {isEmpty ? (
        <div style={{
          textAlign: 'center',
          padding: '5rem 2rem',
          color: 'rgba(255,255,255,0.3)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📂</div>
          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.5)' }}>
            {emptyMessage || 'Próximamente'}
          </p>
          <p style={{ fontSize: '0.9rem' }}>
            Los documentos estarán disponibles en esta sección a medida que se publiquen.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.4)' }}>
          <p>No se encontraron documentos con esos filtros.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1rem',
        }}>
          {filtered.map(doc => (
            <DocumentCard key={doc.id} doc={doc} />
          ))}
        </div>
      )}

      {!isEmpty && (
        <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', textAlign: 'right' }}>
          {filtered.length} documento{filtered.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}

function DocumentCard({ doc }: { doc: Documento }) {
  const icono = CATEGORIA_ICONS[doc.categoria] || '📎';
  const hasFile = Boolean(doc.url_publica);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '1rem',
      padding: '1.25rem 1.5rem',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '14px',
      transition: 'all 0.2s ease',
    }}>
      <div style={{
        fontSize: '1.5rem',
        flexShrink: 0,
        width: '44px',
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '10px',
      }}>
        {icono}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontWeight: 700,
          fontSize: '0.95rem',
          color: 'white',
          marginBottom: '0.25rem',
          lineHeight: 1.3,
        }}>
          {doc.titulo}
        </p>
        {doc.descripcion && (
          <p style={{
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.5)',
            marginBottom: '0.75rem',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          } as React.CSSProperties}>
            {doc.descripcion}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'rgba(255,255,255,0.3)',
          }}>
            {doc.categoria}
          </span>
          {hasFile ? (
            <a
              href={doc.url_publica!}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--color-secondary-container)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                textDecoration: 'none',
              }}
            >
              ⬇ Descargar
            </a>
          ) : (
            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>
              Próximamente
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
