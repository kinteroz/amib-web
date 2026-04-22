'use client';

import React, { useState, useEffect } from 'react';
import { getNoticias, upsertNoticia, deleteNoticia } from '@/lib/cms-actions';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

export default function AdminNoticias() {
  const [noticias, setNoticias] = useState<any[]>([]);
  const [editingNoticia, setEditingNoticia] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadNoticias();
  }, []);

  async function loadNoticias() {
    setLoading(true);
    try {
      const data = await getNoticias();
      setNoticias(data);
    } catch (err) {
      console.error(err);
      alert('Error al cargar noticias');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editingNoticia) return;
    
    setSaving(true);
    try {
      await upsertNoticia(editingNoticia);
      setEditingNoticia(null);
      await loadNoticias();
    } catch (err) {
      console.error(err);
      alert('Error al guardar noticia');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de eliminar esta noticia?')) return;
    try {
      await deleteNoticia(id);
      await loadNoticias();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar');
    }
  }

  if (loading) return <div style={{ padding: '2rem' }}>Cargando administrador de noticias...</div>;

  return (
    <div style={{ maxWidth: '1200px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#0f172a', fontWeight: 700 }}>Gestión de Actualidad</h1>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Administra noticias con soporte para multimedia y SEO.</p>
        </div>
        <button 
          onClick={() => setEditingNoticia({ 
            titulo: '', 
            categoria: 'EDUCACION',
            publicado: true, 
            destacado: false,
            fecha_publicacion: new Date().toISOString().split('T')[0],
            contenido: '# Nueva Noticia\n\nEscribe aquí el contenido...',
            resumen: '',
            imagen_url: '',
            video_url: '',
            slug: ''
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
          + Nueva Noticia
        </button>
      </header>

      {/* List */}
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {noticias.map((noticia) => (
          <div key={noticia.id} style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '12px', 
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem'
          }}>
            <div style={{ 
              width: '100px', 
              height: '65px', 
              borderRadius: '8px', 
              overflow: 'hidden',
              background: '#f1f5f9',
              flexShrink: 0
            }}>
              {noticia.video_url ? (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#001F3F', color: 'white', fontSize: '0.6rem' }}>VIDEO</div>
              ) : noticia.imagen_url ? (
                <img src={noticia.imagen_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>IMG</div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontWeight: 700, color: '#0f172a' }}>{noticia.titulo}</h3>
                {noticia.destacado && <span style={{ fontSize: '0.6rem', background: '#fef3c7', color: '#b45309', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>⭐ DESTACADO</span>}
                {!noticia.publicado && <span style={{ fontSize: '0.6rem', background: '#fee2e2', color: '#991b1b', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>BORRADOR</span>}
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                Slug: <code>/{noticia.slug}</code> | Categoría: <strong>{noticia.categoria}</strong>
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => setEditingNoticia(noticia)}
                style={{ padding: '0.5rem 1rem', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
              >
                Editar
              </button>
              <button 
                onClick={() => handleDelete(noticia.id)}
                style={{ padding: '0.5rem 1rem', border: '1px solid #fee2e2', borderRadius: '6px', background: 'white', color: '#ef4444', fontWeight: 600, cursor: 'pointer' }}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Advanced Editor Modal */}
      <AnimatePresence>
        {editingNoticia && (
          <div style={{ 
            position: 'fixed', 
            inset: 0, 
            zIndex: 100, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '1rem'
          }}>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setEditingNoticia(null)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} 
            />
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.98 }}
              style={{ 
                position: 'relative', 
                background: 'white', 
                width: '100%', 
                maxWidth: '1200px', 
                height: '95vh', 
                overflow: 'hidden',
                borderRadius: '24px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
              }}
            >
              {/* Modal Header */}
              <div style={{ padding: '1.5rem 2.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Editor de Experiencia Inmersiva</h2>
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Configure el contenido, multimedia y SEO de la noticia.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button 
                    onClick={() => setPreviewMode(!previewMode)}
                    style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: previewMode ? '#001F3F' : 'white', color: previewMode ? 'white' : '#475569', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    {previewMode ? 'Ver Editor' : 'Previsualizar'}
                  </button>
                  <button 
                    onClick={() => setEditingNoticia(null)}
                    style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Cerrar
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    style={{ padding: '0.6rem 2rem', borderRadius: '8px', border: 'none', background: '#001F3F', color: 'white', fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}
                  >
                    {saving ? 'Guardando...' : 'Publicar Noticia'}
                  </button>
                </div>
              </div>

              <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
                {/* Main Form Area */}
                {!previewMode ? (
                  <div style={{ flex: 1, overflowY: 'auto', padding: '2.5rem', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2.5rem' }}>
                    <div style={{ display: 'grid', gap: '2rem' }}>
                      <section>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Cabecera y SEO</label>
                        <input
                          type="text"
                          placeholder="Título de la noticia..."
                          value={editingNoticia?.titulo || ''}
                          onChange={(e) => setEditingNoticia({ ...editingNoticia, titulo: e.target.value })}
                          style={{
                            width: '100%',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            padding: '1.25rem',
                            color: 'white',
                            fontSize: '1.5rem',
                            fontWeight: 800,
                            marginBottom: '1rem',
                            outline: 'none'
                          }}
                        />
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                          <input
                            type="text"
                            placeholder="Slug (url-amigable)"
                            value={editingNoticia?.slug || ''}
                            onChange={(e) => setEditingNoticia({ ...editingNoticia, slug: e.target.value })}
                            style={{
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '8px',
                              padding: '0.75rem 1rem',
                              color: 'rgba(255,255,255,0.9)',
                              fontSize: '0.9rem',
                              outline: 'none'
                            }}
                          />
                          <select
                            value={editingNoticia?.categoria || 'PRENSA'}
                            onChange={(e) => setEditingNoticia({ ...editingNoticia, categoria: e.target.value })}
                            style={{
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '8px',
                              padding: '0.75rem 1rem',
                              color: 'white',
                              fontSize: '0.9rem',
                              outline: 'none'
                            }}
                          >
                            <option value="INSTITUCIONAL">Institucional</option>
                            <option value="MERCADOS">Mercados</option>
                            <option value="EDUCACION">Educación</option>
                            <option value="PRENSA">Prensa</option>
                          </select>
                        </div>
                        <textarea 
                          placeholder="Cuéntanos la historia..."
                          value={editingNoticia.contenido || ''} 
                          onChange={(e) => setEditingNoticia({...editingNoticia, contenido: e.target.value})}
                          style={{ width: '100%', minHeight: '400px', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontFamily: 'Inter, sans-serif', lineHeight: 1.6, resize: 'vertical' }}
                        />
                      </section>
                    </div>

                    <div style={{ display: 'grid', gap: '2rem', alignContent: 'start' }}>
                      <section style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '1rem' }}>Multimedia Principal</label>
                        <div style={{ marginBottom: '1.5rem' }}>
                          <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.4rem', color: '#475569' }}>Imagen de Portada (URL)</label>
                          <input 
                            type="text" 
                            value={editingNoticia.imagen_url || ''} 
                            onChange={(e) => setEditingNoticia({...editingNoticia, imagen_url: e.target.value})}
                            style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                          />
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                          <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.4rem', color: '#475569' }}>Video Principal (YouTube/Vimeo/MP4)</label>
                          <input 
                            type="text" 
                            placeholder="https://..."
                            value={editingNoticia.video_url || ''} 
                            onChange={(e) => setEditingNoticia({...editingNoticia, video_url: e.target.value})}
                            style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                          />
                        </div>
                        {editingNoticia.imagen_url && (
                          <div style={{ width: '100%', height: '150px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                            <img src={editingNoticia.imagen_url} alt="Vista previa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}
                      </section>

                      <section style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '1rem' }}>Resumen de Listado</label>
                        <textarea 
                          value={editingNoticia.resumen || ''} 
                          onChange={(e) => setEditingNoticia({...editingNoticia, resumen: e.target.value})}
                          style={{ width: '100%', height: '100px', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', resize: 'none', fontSize: '0.9rem' }}
                        />
                      </section>

                      <section style={{ padding: '0.5rem' }}>
                         <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', cursor: 'pointer' }}>
                          <input type="checkbox" checked={editingNoticia.destacado} onChange={(e) => setEditingNoticia({...editingNoticia, destacado: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>Destacar en portada</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                          <input type="checkbox" checked={editingNoticia.publicado} onChange={(e) => setEditingNoticia({...editingNoticia, publicado: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>Publicar ahora</span>
                        </label>
                      </section>
                    </div>
                  </div>
                ) : (
                  /* Live Preview Area */
                  <div style={{ flex: 1, overflowY: 'auto', background: '#001F3F', color: 'white', padding: '4rem 2rem' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                      <span style={{ color: '#eab308', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase' }}>{editingNoticia.categoria}</span>
                      <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginTop: '1rem', marginBottom: '2rem', lineHeight: 1.1 }}>{editingNoticia.titulo}</h1>
                      
                      {editingNoticia.imagen_url && !editingNoticia.video_url && (
                        <img src={editingNoticia.imagen_url} alt="" style={{ width: '100%', borderRadius: '24px', marginBottom: '3rem', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }} />
                      )}
                      
                      {editingNoticia.video_url && (
                        <div style={{ width: '100%', aspectRatio: '16/9', background: 'black', borderRadius: '24px', marginBottom: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ color: 'white' }}>Vista previa de video: {editingNoticia.video_url}</span>
                        </div>
                      )}

                      <div className="prose-dark" style={{ fontSize: '1.2rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.8)' }}>
                        <ReactMarkdown>{editingNoticia.contenido}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
