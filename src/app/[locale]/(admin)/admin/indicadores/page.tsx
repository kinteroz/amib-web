'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AdminIndicadores() {
  const [indicators, setIndicators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchIndicators();
  }, []);

  const fetchIndicators = async () => {
    const { data } = await (supabase
      .from('market_indicators' as any) as any)
      .select('*')
      .order('orden', { ascending: true });
    
    setIndicators(data || []);
    setLoading(false);
  };

  const handleUpdate = async (id: string, newValue: string, newTrend: number) => {
    const { error } = await (supabase
      .from('market_indicators' as any) as any)
      .update({ value: newValue, trend: newTrend, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
        console.error(error);
        alert('Error al actualizar');
    } else {
        fetchIndicators();
    }
  };

  return (
    <div>
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#0f172a', fontWeight: 700 }}>Indicadores de Mercado</h1>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Control de datos financieros para la Market Bar.</p>
        </div>
      </header>

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Indicador</th>
              <th style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Símbolo</th>
              <th style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Valor Actual</th>
              <th style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Tendencia (%)</th>
              <th style={{ padding: '1.25rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>Cargando indicadores...</td></tr>
            ) : indicators.map((ind) => (
              <tr key={ind.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1.25rem', fontWeight: 600, color: '#0f172a' }}>{ind.label}</td>
                <td style={{ padding: '1.25rem', color: '#64748b', fontFamily: 'monospace' }}>{ind.symbol}</td>
                <td style={{ padding: '1.25rem' }}>
                    <input 
                        type="text" 
                        defaultValue={ind.value} 
                        id={`val-${ind.id}`}
                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0', width: '120px' }}
                    />
                </td>
                <td style={{ padding: '1.25rem' }}>
                    <input 
                        type="number" 
                        step="0.01"
                        defaultValue={ind.trend} 
                        id={`trend-${ind.id}`}
                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0', width: '80px' }}
                    />
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <button 
                    onClick={() => {
                        const val = (document.getElementById(`val-${ind.id}`) as HTMLInputElement).value;
                        const trend = parseFloat((document.getElementById(`trend-${ind.id}`) as HTMLInputElement).value);
                        handleUpdate(ind.id, val, trend);
                    }}
                    style={{ 
                        background: '#001F3F', 
                        color: 'white', 
                        border: 'none', 
                        padding: '0.5rem 1rem', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                    }}
                  >
                    Guardar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#e0f2fe', borderRadius: '8px', color: '#0369a1', fontSize: '0.9rem' }}>
        <strong>Tip:</strong> Los cambios realizados aquí se reflejan instantáneamente en la barra dinámica del Hero.
      </div>
    </div>
  );
}
