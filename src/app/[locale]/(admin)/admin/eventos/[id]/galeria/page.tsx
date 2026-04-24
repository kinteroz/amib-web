'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function GestorGaleria({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const supabase = createClient();
  const [galeria, setGaleria] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchGaleria();
  }, [id]);

  const fetchGaleria = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('evento_galeria')
      .select('*')
      .eq('evento_id', id)
      .order('orden', { ascending: true });
    
    setGaleria(data || []);
    setLoading(false);
  };

  const addMedia = () => {
    setGaleria([...galeria, { evento_id: id, media_url: '', media_tipo: 'image', titulo: '', orden: galeria.length }]);
  };

  const updateMedia = (idx: number, field: string, val: any) => {
    const newItems = [...galeria];
    newItems[idx] = { ...newItems[idx], [field]: val };
    setGaleria(newItems);
  };

  const removeMedia = (idx: number) => {
    setGaleria(galeria.filter((_, i) => i !== idx));
  };

  const saveGaleria = async () => {
    setSaving(true);
    try {
      await supabase.from('evento_galeria').delete().eq('evento_id', id);
      
      const toSave = galeria.map(({ id: _id, created_at, ...g }, index) => ({
        ...g,
        evento_id: id,
        orden: index
      }));

      if (toSave.length > 0) {
        const { error } = await supabase.from('evento_galeria').insert(toSave);
        if (error) throw error;
      }
      
      alert('Galería guardada exitosamente');
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
          <h1 style={{ fontSize: '2rem', color: '#0f172a', fontWeight: 700 }}>Galería del Evento</h1>
        </div>
        <button 
          onClick={saveGaleria} disabled={saving}
          style={{ background: '#001F3F', color: 'white', border: 'none', padding: '0.8rem 2rem', borderRadius: '8px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </header>

      {loading ? (
        <div>Cargando...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
          {galeria.map((g, idx) => (
            <div key={idx} style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '200px', background: '#f1f5f9', position: 'relative' }}>
                {g.media_url && g.media_tipo === 'image' && <img src={g.media_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                {g.media_url && g.media_tipo === 'video' && <video src={g.media_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                <button onClick={() => removeMedia(idx)} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(255,0,0,0.8)', color: 'white', border: 'none', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', fontWeight: 700 }}>×</button>
              </div>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <select value={g.media_tipo} onChange={e => updateMedia(idx, 'media_tipo', e.target.value)} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <option value="image">Imagen</option>
                    <option value="video">Video</option>
                </select>
                <input placeholder="URL del archivo" value={g.media_url} onChange={e => updateMedia(idx, 'media_url', e.target.value)} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                <input placeholder="Título o Pie de foto" value={g.titulo || ''} onChange={e => updateMedia(idx, 'titulo', e.target.value)} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>
            </div>
          ))}

          <div onClick={addMedia} style={{ background: 'white', border: '2px dashed #cbd5e1', color: '#64748b', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '350px', cursor: 'pointer', fontWeight: 600, fontSize: '1.1rem', flexDirection: 'column', gap: '1rem' }}>
            <span style={{ fontSize: '2rem' }}>+</span>
            Añadir Medio
          </div>
        </div>
      )}
    </div>
  );
}
