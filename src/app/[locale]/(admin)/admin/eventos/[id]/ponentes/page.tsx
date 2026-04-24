'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function GestorPonentes({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const supabase = createClient();
  const [ponentes, setPonentes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPonentes();
  }, [id]);

  const fetchPonentes = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('evento_ponentes')
      .select('*')
      .eq('evento_id', id)
      .order('orden', { ascending: true });
    
    setPonentes(data || []);
    setLoading(false);
  };

  const addPonente = () => {
    setPonentes([...ponentes, { evento_id: id, nombre: '', cargo: '', bio: '', imagen_url: '', orden: ponentes.length }]);
  };

  const updatePonente = (idx: number, field: string, val: any) => {
    const newItems = [...ponentes];
    newItems[idx] = { ...newItems[idx], [field]: val };
    setPonentes(newItems);
  };

  const removePonente = (idx: number) => {
    setPonentes(ponentes.filter((_, i) => i !== idx));
  };

  const savePonentes = async () => {
    setSaving(true);
    try {
      // Very simple sync: delete all and insert new. In production you'd upsert.
      await supabase.from('evento_ponentes').delete().eq('evento_id', id);
      
      const toSave = ponentes.map(({ id: _id, created_at, updated_at, ...p }, index) => ({
        ...p,
        evento_id: id,
        orden: index
      }));

      if (toSave.length > 0) {
        const { error } = await supabase.from('evento_ponentes').insert(toSave);
        if (error) throw error;
      }
      
      alert('Ponentes guardados exitosamente');
    } catch (err: any) {
      alert(`Error al guardar: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Link href={`/admin/eventos/${id}/editar`} style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'inline-block' }}>
            ← Volver al Evento
          </Link>
          <h1 style={{ fontSize: '2rem', color: '#0f172a', fontWeight: 700 }}>Gestión de Ponentes</h1>
        </div>
        <button 
          onClick={savePonentes} disabled={saving}
          style={{ background: '#001F3F', color: 'white', border: 'none', padding: '0.8rem 2rem', borderRadius: '8px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </header>

      {loading ? (
        <div>Cargando...</div>
      ) : (
        <div style={{ display: 'grid', gap: '2rem' }}>
          {ponentes.map((p, idx) => (
            <div key={idx} style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', gap: '2rem' }}>
              <div style={{ width: '150px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ width: '150px', height: '150px', background: p.imagen_url ? `url(${p.imagen_url}) center/cover` : '#f1f5f9', borderRadius: '8px', border: '1px dashed #cbd5e1' }} />
                <input placeholder="URL Imagen" value={p.imagen_url || ''} onChange={e => updatePonente(idx, 'imagen_url', e.target.value)} style={{ padding: '0.5rem', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ flex: 1, display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <input placeholder="Nombre Completo" value={p.nombre} onChange={e => updatePonente(idx, 'nombre', e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 600 }} />
                    <input placeholder="Cargo / Título" value={p.cargo || ''} onChange={e => updatePonente(idx, 'cargo', e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <textarea placeholder="Biografía corta" value={p.bio || ''} onChange={e => updatePonente(idx, 'bio', e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', minHeight: '80px' }} />
              </div>
              <button onClick={() => removePonente(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.5rem', alignSelf: 'flex-start' }}>×</button>
            </div>
          ))}

          <button onClick={addPonente} style={{ background: 'white', border: '2px dashed #cbd5e1', color: '#64748b', padding: '2rem', borderRadius: '16px', fontWeight: 600, cursor: 'pointer', fontSize: '1.1rem' }}>
            + Añadir Ponente
          </button>
        </div>
      )}
    </div>
  );
}
