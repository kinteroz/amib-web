'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AdminNoticias() {
  const [noticias, setNoticias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchNoticias();
  }, []);

  const fetchNoticias = async () => {
    const { data } = await (supabase
      .from('noticias' as any) as any)
      .select('*')
      .order('created_at', { ascending: false });
    
    setNoticias(data || []);
    setLoading(false);
  };

  const togglePublicado = async (id: string, currentState: boolean) => {
    const { error } = await (supabase
      .from('noticias' as any) as any)
      .update({ publicado: !currentState })
      .eq('id', id);

    if (!error) fetchNoticias();
    else console.error(error);
  };

  return (
    <div>
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#0f172a', fontWeight: 700 }}>Gestión de Actualidad</h1>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Administra las noticias y comunicados institucionales.</p>
        </div>
        <button style={{ 
            background: '#001F3F', 
            color: 'white', 
            border: 'none', 
            padding: '0.8rem 1.5rem', 
            borderRadius: '8px', 
            fontWeight: 600,
            cursor: 'not-allowed',
            opacity: 0.6
        }}>
          + Nueva Noticia (Próximamente)
        </button>
      </header>

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Título</th>
              <th style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Categoría</th>
              <th style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Fecha</th>
              <th style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Estado</th>
              <th style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>Cargando noticias...</td></tr>
            ) : noticias.map((noticia) => (
              <tr key={noticia.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1.25rem', fontWeight: 600, color: '#0f172a', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {noticia.titulo}
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: '#f1f5f9', borderRadius: '4px', color: '#475569' }}>
                    {noticia.categoria || 'Sin categoría'}
                  </span>
                </td>
                <td style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748b' }}>
                  {noticia.fecha_publicacion ? new Date(noticia.fecha_publicacion).toLocaleDateString() : 'N/A'}
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '4px', 
                    background: noticia.publicado ? '#dcfce7' : '#fee2e2',
                    color: noticia.publicado ? '#166534' : '#991b1b'
                  }}>
                    {noticia.publicado ? 'Publicado' : 'Borrador'}
                  </span>
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <button 
                    onClick={() => togglePublicado(noticia.id, noticia.publicado)}
                    style={{ 
                        background: 'transparent', 
                        color: '#001F3F', 
                        border: '1px solid #001F3F', 
                        padding: '0.4rem 0.8rem', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                    }}
                  >
                    {noticia.publicado ? 'Archivar' : 'Publicar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
