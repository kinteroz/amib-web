'use client';

import React, { useState, useEffect } from 'react';
import { getBanners, upsertBanner, deleteBanner, updateBannerOrder } from '@/lib/cms-actions';
import { Database } from '@/types/database.types';
import { motion, AnimatePresence } from 'framer-motion';

type Banner = Database['public']['Tables']['banners']['Row'];

export default function BannersAdmin() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [editingBanner, setEditingBanner] = useState<Partial<Banner> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadBanners();
  }, []);

  async function loadBanners() {
    setLoading(true);
    try {
      const data = await getBanners();
      setBanners(data);
    } catch (err) {
      console.error(err);
      alert('Error al cargar banners');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editingBanner) return;
    
    setSaving(true);
    try {
      await upsertBanner(editingBanner as any);
      setEditingBanner(null);
      await loadBanners();
    } catch (err) {
      console.error(err);
      alert('Error al guardar banner');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de eliminar este slide?')) return;
    try {
      await deleteBanner(id);
      await loadBanners();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar');
    }
  }

  const addStat = () => {
    const currentStats = Array.isArray(editingBanner?.estadisticas_json) 
      ? [...editingBanner.estadisticas_json] 
      : [];
    setEditingBanner({
      ...editingBanner,
      estadisticas_json: [...currentStats, { valor: '0', label: 'Nuevo Dato' }]
    });
  };

  const updateStat = (index: number, field: string, value: string) => {
    const currentStats = [...(editingBanner?.estadisticas_json as any[])];
    currentStats[index][field] = value;
    setEditingBanner({ ...editingBanner, estadisticas_json: currentStats });
  };

  const removeStat = (index: number) => {
    const currentStats = [...(editingBanner?.estadisticas_json as any[])];
    currentStats.splice(index, 1);
    setEditingBanner({ ...editingBanner, estadisticas_json: currentStats });
  };

  if (loading) return <div style={{ padding: '2rem' }}>Cargando administrador de banners...</div>;

  return (
    <div style={{ maxWidth: '1200px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#0f172a', fontWeight: 700 }}>Gestión de Hero Carousel</h1>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Administra los slides, efectos y layouts de la página principal.</p>
        </div>
        <button 
          onClick={() => setEditingBanner({ 
            titulo: 'Nuevo Slide', 
            activo: true, 
            tipo_hero: 'fullscreen-image',
            efecto_overlay: 'none',
            media_tipo: 'image',
            orden: banners.length,
            estadisticas_json: []
          })}
          style={{ 
            padding: '0.75rem 1.5rem', 
            background: '#001F3F', 
            color: 'white', 
            borderRadius: '8px', 
            border: 'none', 
            fontWeight: 600, 
            cursor: 'pointer' 
          }}
        >
          + Agregar Slide
        </button>
      </header>

      {/* List of Banners */}
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {banners.map((banner) => (
          <div key={banner.id} style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '12px', 
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem'
          }}>
            <div style={{ 
              width: '120px', 
              height: '80px', 
              borderRadius: '8px', 
              overflow: 'hidden',
              background: '#f1f5f9',
              flexShrink: 0
            }}>
              {banner.media_tipo === 'video' ? (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#001F3F', color: 'white', fontSize: '0.8rem' }}>VIDEO</div>
              ) : (
                <img src={banner.media_url || ''} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontWeight: 700, color: '#0f172a' }}>{banner.titulo}</h3>
                {!banner.activo && <span style={{ fontSize: '0.7rem', background: '#fee2e2', color: '#991b1b', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>INACTIVO</span>}
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                Layout: <strong>{banner.tipo_hero}</strong> | Efecto: <strong>{banner.efecto_overlay}</strong>
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => setEditingBanner(banner)}
                style={{ padding: '0.5rem 1rem', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
              >
                Editar
              </button>
              <button 
                onClick={() => handleDelete(banner.id)}
                style={{ padding: '0.5rem 1rem', border: '1px solid #fee2e2', borderRadius: '6px', background: 'white', color: '#ef4444', cursor: 'pointer' }}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {editingBanner && (
          <div style={{ 
            position: 'fixed', 
            inset: 0, 
            zIndex: 100, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '2rem'
          }}>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setEditingBanner(null)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} 
            />
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              style={{ 
                position: 'relative', 
                background: 'white', 
                width: '100%', 
                maxWidth: '900px', 
                maxHeight: '90vh', 
                overflowY: 'auto',
                borderRadius: '24px',
                padding: '3rem',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
              }}
            >
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem' }}>Configurar Slide</h2>
              
              <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Basic Info */}
                <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                   <div className="input-group">
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Tipo de Hero</label>
                    <select 
                      value={editingBanner.tipo_hero}
                      onChange={(e) => setEditingBanner({...editingBanner, tipo_hero: e.target.value as any})}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    >
                      <option value="fullscreen-image">Fullscreen Imagen</option>
                      <option value="fullscreen-video">Fullscreen Video</option>
                      <option value="split">Split (Texto + Media)</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Efecto Visual</label>
                    <select 
                      value={editingBanner.efecto_overlay}
                      onChange={(e) => setEditingBanner({...editingBanner, efecto_overlay: e.target.value as any})}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    >
                      <option value="none">Ninguno</option>
                      <option value="matrix">Matrix (Caracteres)</option>
                      <option value="pulse">Pulse (Ondas)</option>
                      <option value="grain">Grano Cinematográfico</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Duración (seg)</label>
                    <input 
                      type="number" 
                      value={editingBanner.duracion || 7} 
                      onChange={(e) => setEditingBanner({...editingBanner, duracion: parseInt(e.target.value) || 7})}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      min={1}
                    />
                    <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.4rem' }}>* Los videos avanzan al terminar.</p>
                  </div>
                  <div className="input-group">
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Estado</label>
                    <div style={{ display: 'flex', gap: '1rem', paddingTop: '0.5rem' }}>
                      <label><input type="checkbox" checked={editingBanner.activo} onChange={(e) => setEditingBanner({...editingBanner, activo: e.target.checked})} /> Activo</label>
                    </div>
                  </div>
                </div>

                {/* Media */}
                <div style={{ gridColumn: '1 / -1', background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                   <div style={{ display: 'flex', gap: '2rem' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>URL del Media (Imagen o Video MP4)</label>
                        <input 
                          type="text" 
                          value={editingBanner.media_url || ''} 
                          onChange={(e) => setEditingBanner({...editingBanner, media_url: e.target.value})}
                          placeholder="https://..."
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        />
                      </div>
                      <div style={{ width: '200px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Tipo de Media</label>
                        <select 
                          value={editingBanner.media_tipo}
                          onChange={(e) => setEditingBanner({...editingBanner, media_tipo: e.target.value as any})}
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        >
                          <option value="image">Imagen</option>
                          <option value="video">Video</option>
                        </select>
                      </div>
                   </div>
                   <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.5rem' }}>Para videos, usa una URL directa a un archivo .mp4 (ej. Cloudinary o Supabase Storage).</p>
                </div>

                {/* Texts */}
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                   <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Etiqueta (Badge)</label>
                    <input 
                      type="text" 
                      value={editingBanner.badge_texto || ''} 
                      onChange={(e) => setEditingBanner({...editingBanner, badge_texto: e.target.value})}
                      placeholder="Ej: Autoridad Bursátil"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Título Principal</label>
                    <input 
                      type="text" 
                      value={editingBanner.titulo || ''} 
                      onChange={(e) => setEditingBanner({...editingBanner, titulo: e.target.value || ''})}
                      required
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1.1rem', fontWeight: 700 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Subtítulo / Descripción</label>
                    <textarea 
                      value={editingBanner.subtitulo || ''} 
                      onChange={(e) => setEditingBanner({...editingBanner, subtitulo: e.target.value})}
                      rows={3}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', resize: 'none' }}
                    />
                  </div>
                </div>

                {/* CTAs & Stats */}
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Botón Principal</label>
                        <input 
                          type="text" 
                          value={editingBanner.cta_texto || ''} 
                          onChange={(e) => setEditingBanner({...editingBanner, cta_texto: e.target.value})}
                          placeholder="Texto"
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '0.5rem' }}
                        />
                        <input 
                          type="text" 
                          value={editingBanner.cta_enlace || ''} 
                          onChange={(e) => setEditingBanner({...editingBanner, cta_enlace: e.target.value})}
                          placeholder="URL"
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Botón Secundario</label>
                        <input 
                          type="text" 
                          value={editingBanner.cta_texto_2 || ''} 
                          onChange={(e) => setEditingBanner({...editingBanner, cta_texto_2: e.target.value})}
                          placeholder="Texto"
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '0.5rem' }}
                        />
                        <input 
                          type="text" 
                          value={editingBanner.cta_enlace_2 || ''} 
                          onChange={(e) => setEditingBanner({...editingBanner, cta_enlace_2: e.target.value})}
                          placeholder="URL"
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        />
                      </div>
                   </div>

                   <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Estadísticas / Counters</label>
                        <button type="button" onClick={addStat} style={{ fontSize: '0.75rem', color: '#001F3F', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>+ Agregar</button>
                      </div>
                      <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {(editingBanner.estadisticas_json as any[])?.map((stat, i) => (
                          <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input 
                              type="text" 
                              value={stat.valor} 
                              onChange={(e) => updateStat(i, 'valor', e.target.value)}
                              placeholder="Valor (ej: 40+)"
                              style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                            />
                            <input 
                              type="text" 
                              value={stat.label} 
                              onChange={(e) => updateStat(i, 'label', e.target.value)}
                              placeholder="Etiqueta"
                              style={{ flex: 2, padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                            />
                            <button type="button" onClick={() => removeStat(i)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}>×</button>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>

                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                   <button 
                    type="button" 
                    onClick={() => setEditingBanner(null)}
                    style={{ padding: '0.75rem 2rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                   >
                    Cancelar
                   </button>
                   <button 
                    type="submit" 
                    disabled={saving}
                    style={{ 
                      padding: '0.75rem 3rem', 
                      background: '#001F3F', 
                      color: 'white', 
                      borderRadius: '8px', 
                      border: 'none', 
                      fontWeight: 600, 
                      cursor: 'pointer',
                      opacity: saving ? 0.7 : 1
                    }}
                   >
                    {saving ? 'Guardando...' : 'Guardar Slide'}
                   </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
