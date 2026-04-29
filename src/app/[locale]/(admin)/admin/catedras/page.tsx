'use client';

import React, { useState, useEffect, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function AdminCatedras({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const [catedras, setCatedras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchCatedras();
  }, []);

  const fetchCatedras = async () => {
    const { data, error } = await supabase
      .from('catedras')
      .select(`
        *,
        instituciones_educativas (nombre),
        materias (count),
        auth_users:encargado_amib_id (email, raw_user_meta_data)
      `)
      .order('fecha_inicio', { ascending: false });
    
    if (error) console.error(error);
    setCatedras(data || []);
    setLoading(false);
  };

  return (
    <div>
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#0f172a', fontWeight: 700 }}>Cátedras (Programas)</h1>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Gestiona los programas impartidos en convenio con instituciones educativas.</p>
        </div>
        <Link href={`/${locale}/admin/catedras/nueva`} style={{ 
            background: '#001F3F', 
            color: 'white', 
            border: 'none', 
            padding: '0.8rem 1.5rem', 
            borderRadius: '8px', 
            fontWeight: 600,
            textDecoration: 'none'
        }}>
          + Nuevo Programa
        </Link>
      </header>

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Cátedra / Programa</th>
              <th style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Institución</th>
              <th style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Encargado</th>
              <th style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Materias</th>
              <th style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Estatus</th>
              <th style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>Cargando programas...</td></tr>
            ) : catedras.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>No hay programas registrados.</td></tr>
            ) : catedras.map((cat) => (
              <tr key={cat.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1.25rem', fontWeight: 600, color: '#0f172a' }}>
                  {cat.nombre}
                </td>
                <td style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#475569' }}>
                  {cat.instituciones_educativas?.nombre || 'N/A'}
                </td>
                <td style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#475569' }}>
                  {cat.auth_users ? (
                    <div>
                      <div style={{ fontWeight: 600 }}>{cat.auth_users.raw_user_meta_data?.full_name || 'Usuario'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{cat.auth_users.email}</div>
                    </div>
                  ) : (
                    <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Sin asignar</span>
                  )}
                </td>
                <td style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748b' }}>
                  {cat.materias?.[0]?.count || 0} registradas
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    padding: '0.25rem 0.5rem', 
                    background: cat.estatus === 'ACTIVA' ? '#f0fdf4' : cat.estatus === 'EN_PREPARACION' ? '#eff6ff' : '#f1f5f9',
                    color: cat.estatus === 'ACTIVA' ? '#166534' : cat.estatus === 'EN_PREPARACION' ? '#1e40af' : '#475569',
                    borderRadius: '4px', 
                    fontWeight: 600
                  }}>
                    {cat.estatus}
                  </span>
                </td>
                <td style={{ padding: '1.25rem', display: 'flex', gap: '0.5rem' }}>
                  <Link href={`/${locale}/admin/catedras/${cat.id}`} style={{ 
                        background: '#f8fafc', 
                        color: '#334155', 
                        border: '1px solid #cbd5e1', 
                        padding: '0.4rem 0.8rem', 
                        borderRadius: '6px', 
                        fontSize: '0.75rem',
                        textDecoration: 'none'
                    }}
                  >
                    Gestionar
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
