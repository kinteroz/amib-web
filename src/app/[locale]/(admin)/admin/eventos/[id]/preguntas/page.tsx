'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function GestorPreguntas({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const supabase = createClient();
  const [preguntas, setPreguntas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPreguntas();

    // Suscripción a cambios en tiempo real
    const channel = supabase
      .channel(`admin_preguntas_${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'evento_preguntas', filter: `evento_id=eq.${id}` }, (payload) => {
        fetchPreguntas();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const fetchPreguntas = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('evento_preguntas')
      .select('*')
      .eq('evento_id', id)
      .order('votos', { ascending: false })
      .order('created_at', { ascending: false });
    
    setPreguntas(data || []);
    setLoading(false);
  };

  const toggleEstado = async (preguntaId: string, field: string, currentValue: boolean) => {
    await supabase
        .from('evento_preguntas')
        .update({ [field]: !currentValue })
        .eq('id', preguntaId);
  };

  const deletePregunta = async (preguntaId: string) => {
      if (confirm('¿Estás seguro de eliminar esta pregunta?')) {
          await supabase.from('evento_preguntas').delete().eq('id', preguntaId);
      }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Link href={`/admin/eventos/${id}/editar`} style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'inline-block' }}>
            ← Volver al Evento
          </Link>
          <h1 style={{ fontSize: '2rem', color: '#0f172a', fontWeight: 700 }}>Moderación de Q&A en Vivo</h1>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          {loading && preguntas.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando preguntas...</div>
          ) : preguntas.length === 0 ? (
              <div style={{ padding: '4rem', textAlign: 'center', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', color: '#64748b' }}>
                  No hay preguntas en este momento.
              </div>
          ) : (
              preguntas.map(p => (
                  <div key={p.id} style={{ 
                      background: 'white', 
                      padding: '1.5rem 2rem', 
                      borderRadius: '16px', 
                      border: p.destacada ? '2px solid #eab308' : '1px solid #e2e8f0',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      opacity: p.respondida ? 0.6 : 1
                  }}>
                      <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                              <span style={{ fontWeight: 700, color: '#0f172a' }}>{p.autor_nombre}</span>
                              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{new Date(p.created_at).toLocaleTimeString()}</span>
                              <span style={{ background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>👍 {p.votos} Votos</span>
                          </div>
                          <p style={{ fontSize: '1.1rem', color: '#0f172a', margin: 0 }}>{p.pregunta}</p>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <button 
                              onClick={() => toggleEstado(p.id, 'destacada', p.destacada)}
                              style={{ background: p.destacada ? '#fef08a' : 'white', color: p.destacada ? '#854d0e' : '#64748b', border: '1px solid', borderColor: p.destacada ? '#fef08a' : '#cbd5e1', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                          >
                              {p.destacada ? '★ Destacada' : '☆ Destacar'}
                          </button>
                          
                          <button 
                              onClick={() => toggleEstado(p.id, 'respondida', p.respondida)}
                              style={{ background: p.respondida ? '#dcfce7' : 'white', color: p.respondida ? '#166534' : '#64748b', border: '1px solid', borderColor: p.respondida ? '#dcfce7' : '#cbd5e1', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                          >
                              {p.respondida ? '✓ Respondida' : 'Marcar Respondida'}
                          </button>

                          <button onClick={() => deletePregunta(p.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '1.5rem', cursor: 'pointer', padding: '0.5rem' }}>
                              ×
                          </button>
                      </div>
                  </div>
              ))
          )}
      </div>
    </div>
  );
}
