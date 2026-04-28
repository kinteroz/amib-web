'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function AdminInstituciones() {
  const [instituciones, setInstituciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchInstituciones();
  }, []);

  const fetchInstituciones = async () => {
    const { data, error } = await supabase
      .from('instituciones_educativas')
      .select('*')
      .order('nombre', { ascending: true });
    
    if (error) console.error(error);
    setInstituciones(data || []);
    setLoading(false);
  };

  return (
    <div>
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#0f172a', fontWeight: 700 }}>Instituciones Educativas</h1>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Administra los convenios con universidades y centros de estudio.</p>
        </div>
        <Link href="/admin/instituciones/nueva" style={{ 
            background: '#001F3F', 
            color: 'white', 
            border: 'none', 
            padding: '0.8rem 1.5rem', 
            borderRadius: '8px', 
            fontWeight: 600,
            textDecoration: 'none'
        }}>
          + Nueva Institución
        </Link>
      </header>

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Institución</th>
              <th style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Contacto Principal</th>
              <th style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Email</th>
              <th style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Estatus</th>
              <th style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>Cargando instituciones...</td></tr>
            ) : instituciones.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>No hay instituciones registradas.</td></tr>
            ) : instituciones.map((inst) => (
              <tr key={inst.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1.25rem', fontWeight: 600, color: '#0f172a' }}>
                  {inst.nombre}
                </td>
                <td style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#475569' }}>
                  {inst.contacto_principal || 'N/A'}
                </td>
                <td style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748b' }}>
                  {inst.email || 'N/A'}
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    padding: '0.25rem 0.5rem', 
                    background: inst.estatus === 'ACTIVO' ? '#f0fdf4' : '#fef2f2',
                    color: inst.estatus === 'ACTIVO' ? '#166534' : '#991b1b',
                    borderRadius: '4px', 
                    fontWeight: 600
                  }}>
                    {inst.estatus}
                  </span>
                </td>
                <td style={{ padding: '1.25rem', display: 'flex', gap: '0.5rem' }}>
                  <Link href={`/admin/instituciones/${inst.id}`} style={{ 
                        background: '#f8fafc', 
                        color: '#334155', 
                        border: '1px solid #cbd5e1', 
                        padding: '0.4rem 0.8rem', 
                        borderRadius: '6px', 
                        fontSize: '0.75rem',
                        textDecoration: 'none'
                    }}
                  >
                    Detalles
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
