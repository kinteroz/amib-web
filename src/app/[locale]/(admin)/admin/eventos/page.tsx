'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database.types';
import Link from 'next/link';

export default function AdminEventos() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchEventos();
  }, []);

  const fetchEventos = async () => {
    const { data } = await supabase
      .from('eventos')
      .select('*')
      .order('fecha_inicio', { ascending: false });
    
    setEventos(data || []);
    setLoading(false);
  };

  const toggleStatus = async (id: string, currentState: boolean) => {
    const { error } = await supabase
      .from('eventos')
      // @ts-ignore - Supabase type inference issue with dynamic tables
      .update({ activo: !currentState })
      .eq('id', id);

    if (!error) fetchEventos();
    else console.error(error);
  };

  return (
    <div>
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#0f172a', fontWeight: 700 }}>Catálogo de Eventos</h1>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Administra los foros, semanas y eventos institucionales.</p>
        </div>
        <Link href="/admin/eventos/nuevo" style={{ 
            background: '#001F3F', 
            color: 'white', 
            border: 'none', 
            padding: '0.8rem 1.5rem', 
            borderRadius: '8px', 
            fontWeight: 600,
            textDecoration: 'none'
        }}>
          + Crear Evento
        </Link>
      </header>

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Evento</th>
              <th style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Fecha</th>
              <th style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Modalidad</th>
              <th style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Acceso</th>
              <th style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Estado</th>
              <th style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>Cargando eventos...</td></tr>
            ) : eventos.map((evento) => (
              <tr key={evento.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1.25rem', fontWeight: 600, color: '#0f172a', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {evento.titulo}
                </td>
                <td style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748b' }}>
                  {evento.fecha_inicio ? new Date(evento.fecha_inicio).toLocaleDateString() : 'N/A'}
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: '#f1f5f9', borderRadius: '4px', color: '#475569', textTransform: 'capitalize' }}>
                    {evento.modalidad}
                  </span>
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    padding: '0.25rem 0.5rem', 
                    background: evento.tipo_acceso === 'libre' ? '#f0fdf4' : evento.tipo_acceso === 'pago' ? '#fefce8' : '#faf5ff',
                    color: evento.tipo_acceso === 'libre' ? '#166534' : evento.tipo_acceso === 'pago' ? '#854d0e' : '#6b21a8',
                    borderRadius: '4px', 
                    textTransform: 'capitalize',
                    fontWeight: 600
                  }}>
                    {evento.tipo_acceso}
                  </span>
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '4px', 
                    background: evento.activo ? '#dcfce7' : '#f1f5f9',
                    color: evento.activo ? '#166534' : '#475569'
                  }}>
                    {evento.activo ? 'Activo / Visible' : 'Archivado'}
                  </span>
                </td>
                <td style={{ padding: '1.25rem', display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => toggleStatus(evento.id, evento.activo)}
                    style={{ 
                        background: 'transparent', 
                        color: evento.activo ? '#94a3b8' : '#001F3F', 
                        border: `1px solid ${evento.activo ? '#e2e8f0' : '#001F3F'}`, 
                        padding: '0.4rem 0.8rem', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                    }}
                  >
                    {evento.activo ? 'Ocultar' : 'Re-activar'}
                  </button>
                  <Link href={`/admin/eventos/${evento.id}/editar`} style={{ 
                        background: '#f8fafc', 
                        color: '#334155', 
                        border: '1px solid #cbd5e1', 
                        padding: '0.4rem 0.8rem', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        textDecoration: 'none'
                    }}
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
