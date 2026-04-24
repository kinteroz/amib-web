'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { revalidatePortal } from '@/lib/admin-revalidate';

export default function EditarEvento({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    ubicacion: '',
    modalidad: 'presencial',
    tipo_acceso: 'libre',
    audiencia: 'asociados',
    es_destacado: false,
    imagen_url: '',
    activo: true,
    tipo_hero: 'fullscreen-image',
    efecto_overlay: 'none',
    media_url: '',
    media_tipo: 'image',
    badge_texto: '',
    cta_texto: '',
    layout_tipo: 'classic'
  });

  const [tickets, setTickets] = useState<any[]>([]);
  const [agenda, setAgenda] = useState<any[]>([]);
  const [config, setConfig] = useState({
    permite_invitados: false,
    max_invitados: 0,
    cupo_maximo: 0
  });

  useEffect(() => {
    fetchEvento();
  }, [id]);

  const fetchEvento = async () => {
    setLoading(true);
    try {
        const { data: evento, error } = await supabase
            .from('eventos')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        if (evento) {
            setFormData({
                titulo: evento.titulo || '',
                descripcion: evento.descripcion || '',
                fecha_inicio: evento.fecha_inicio ? new Date(evento.fecha_inicio).toISOString().slice(0, 16) : '',
                fecha_fin: evento.fecha_fin ? new Date(evento.fecha_fin).toISOString().slice(0, 16) : '',
                ubicacion: evento.ubicacion || '',
                modalidad: evento.modalidad || 'presencial',
                tipo_acceso: evento.tipo_acceso || 'libre',
                audiencia: evento.audiencia || 'asociados',
                es_destacado: !!evento.es_destacado,
                imagen_url: evento.imagen_url || '',
                activo: !!evento.activo,
                tipo_hero: evento.tipo_hero || 'fullscreen-image',
                efecto_overlay: evento.efecto_overlay || 'none',
                media_url: evento.media_url || '',
                media_tipo: evento.media_tipo || 'image',
                badge_texto: evento.badge_texto || '',
                cta_texto: evento.cta_texto || '',
                layout_tipo: evento.layout_tipo || 'classic',
            });
            setAgenda(evento.agenda_json || []);
            setConfig(evento.configuracion_registro || { permite_invitados: false, max_invitados: 0 });
        }

        const { data: ticketsData } = await supabase
            .from('evento_tickets')
            .select('*')
            .eq('evento_id', id);
        
        setTickets(ticketsData || []);
    } catch (err) {
        console.error(err);
        alert('Error al cargar el evento');
    } finally {
        setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const val = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: val });
  };

  const updateTicket = (idx: number, field: string, val: any) => {
    const newItems = [...tickets];
    newItems[idx] = { ...newItems[idx], [field]: val };
    setTickets(newItems);
  };

  const updateAgenda = (idx: number, field: string, val: any) => {
    const newItems = [...agenda];
    newItems[idx] = { ...newItems[idx], [field]: val };
    setAgenda(newItems);
  };

  const saveEvento = async () => {
    if (!formData.titulo || !formData.fecha_inicio) {
        alert('El título y la fecha de inicio son obligatorios.');
        return;
    }

    setSaving(true);
    try {
        // Asegurar formato de fechas para PostgreSQL
        const fechaInicio = formData.fecha_inicio ? new Date(formData.fecha_inicio).toISOString() : null;
        const fechaFin = formData.fecha_fin ? new Date(formData.fecha_fin).toISOString() : null;

        const { error: eventError } = await supabase
            .from('eventos')
            .update({
                titulo: formData.titulo,
                descripcion: formData.descripcion,
                fecha_inicio: fechaInicio,
                fecha_fin: fechaFin,
                ubicacion: formData.ubicacion,
                modalidad: formData.modalidad,
                tipo_acceso: formData.tipo_acceso,
                audiencia: formData.audiencia,
                es_destacado: formData.es_destacado,
                imagen_url: formData.imagen_url,
                activo: formData.activo,
                tipo_hero: formData.tipo_hero,
                efecto_overlay: formData.efecto_overlay,
                media_url: formData.media_url,
                media_tipo: formData.media_tipo,
                badge_texto: formData.badge_texto,
                cta_texto: formData.cta_texto,
                layout_tipo: formData.layout_tipo
            })
            .eq('id', id);

        if (eventError) {
            console.log('Error de Supabase:', eventError);
            throw new Error(eventError.message);
        }

        // Actualizar tickets
        if (tickets.length > 0) {
            await supabase.from('evento_tickets').delete().eq('evento_id', id);
            const ticketsToSave = tickets.map(({ id: _, created_at: __, updated_at: ___, ...t }) => ({ 
                ...t, 
                evento_id: id 
            }));
            const { error: ticketsError } = await supabase
                .from('evento_tickets')
                .insert(ticketsToSave);
            
            if (ticketsError) throw ticketsError;
        }

        await revalidatePortal();
        alert('✅ Evento actualizado exitosamente');
        router.push('/admin/eventos');
    } catch (err: any) {
        // Usamos log en lugar de error para evitar bloqueos de UI en algunos navegadores
        console.log('Detalle del error:', err);
        alert(`❌ Error al guardar: ${err.message || 'Error desconocido'}`);
    } finally {
        setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Cargando evento...</div>;

  const tabs = [
    { id: 'general', label: 'Información General' },
    { id: 'design', label: 'Hero y Diseño' },
    { id: 'tickets', label: 'Tickets y Precios' },
    { id: 'agenda', label: 'Agenda (Sesiones)' },
    { id: 'config', label: 'Configuración de Registro' },
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Link href="/admin/eventos" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'inline-block' }}>
            ← Volver al Listado
          </Link>
          <h1 style={{ fontSize: '2rem', color: '#0f172a', fontWeight: 700 }}>Editar Evento</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
            <a 
                href={`/es/eventos/${id}`} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                    background: 'white', 
                    color: '#001F3F', 
                    border: '1px solid #001F3F', 
                    padding: '0.8rem 1.5rem', 
                    borderRadius: '8px', 
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}
            >
                👁️ Vista Previa
            </a>
            <button 
                disabled={saving}
                onClick={saveEvento}
                style={{ 
                    background: '#001F3F', 
                    color: 'white', 
                    border: 'none', 
                    padding: '0.8rem 2rem', 
                    borderRadius: '8px', 
                    fontWeight: 700,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1
                }}
            >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '2rem' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '1rem 1.5rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #001F3F' : '2px solid transparent',
              color: activeTab === tab.id ? '#0f172a' : '#64748b',
              fontWeight: activeTab === tab.id ? 700 : 500,
              cursor: 'pointer',
              fontSize: '0.95rem'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        
        {activeTab === 'general' && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '1rem' }}>Detalles Básicos</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Título del Evento</label>
              <input name="titulo" value={formData.titulo} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Descripción</label>
              <textarea name="descripcion" value={formData.descripcion} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', minHeight: '100px' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Fecha de Inicio</label>
                <input type="datetime-local" name="fecha_inicio" value={formData.fecha_inicio} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Fecha de Fin</label>
                <input type="datetime-local" name="fecha_fin" value={formData.fecha_fin} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Modalidad</label>
                <select name="modalidad" value={formData.modalidad} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <option value="presencial">Presencial</option>
                  <option value="virtual">Virtual</option>
                  <option value="hibrido">Híbrido</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Ubicación</label>
                <input name="ubicacion" value={formData.ubicacion} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>URL de Imagen de Fondo (Full-bleed)</label>
                <input name="imagen_url" value={formData.imagen_url} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} placeholder="https://images.unsplash.com/..." />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                <input type="checkbox" name="es_destacado" id="es_destacado" checked={formData.es_destacado} onChange={handleInputChange} style={{ width: '1.2rem', height: '1.2rem' }} />
                <label htmlFor="es_destacado" style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>Destacar este evento (Aparecerá en el slider de eventos destacados)</label>
            </div>
          </div>
        )}

        {activeTab === 'design' && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '1rem' }}>Diseño Premium del Evento</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Tipo de Hero</label>
                <select name="tipo_hero" value={formData.tipo_hero} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <option value="fullscreen-image">Imagen a Pantalla Completa</option>
                  <option value="fullscreen-video">Video a Pantalla Completa</option>
                  <option value="split">Dividido (Texto a la izq, Media a la der)</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Layout del Detalle</label>
                <select name="layout_tipo" value={formData.layout_tipo} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <option value="classic">Clásico (Standard)</option>
                  <option value="modern">Moderno (Tarjetas y Sombras)</option>
                  <option value="minimal">Minimalista (Limpio y Blanco)</option>
                  <option value="immersive">Inmersivo (Dark Mode)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>URL del Medio (Fondo de Hero)</label>
                <input name="media_url" value={formData.media_url} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} placeholder="https://..." />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Tipo de Medio</label>
                <select name="media_tipo" value={formData.media_tipo} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <option value="image">Imagen</option>
                  <option value="video">Video (MP4)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Efecto Overlay</label>
                <select name="efecto_overlay" value={formData.efecto_overlay} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <option value="none">Ninguno</option>
                  <option value="grain">Ruido (Grain)</option>
                  <option value="pulse">Pulso</option>
                  <option value="matrix">Matrix</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Texto de Etiqueta (Badge)</label>
                <input name="badge_texto" value={formData.badge_texto} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} placeholder="Ej: Nuevo" />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Texto CTA (Llamado a la acción del Hero)</label>
              <input name="cta_texto" value={formData.cta_texto} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} placeholder="Ej: Regístrate Ahora" />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Acciones rápidas para este evento:</p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Link href={`/admin/eventos/${id}/ponentes`} style={{ background: '#e2e8f0', color: '#0f172a', padding: '0.5rem 1rem', borderRadius: '6px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Gestor de Ponentes →</Link>
                <Link href={`/admin/eventos/${id}/galeria`} style={{ background: '#e2e8f0', color: '#0f172a', padding: '0.5rem 1rem', borderRadius: '6px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Galería de Medios →</Link>
                <Link href={`/admin/eventos/${id}/asistentes`} style={{ background: '#e2e8f0', color: '#0f172a', padding: '0.5rem 1rem', borderRadius: '6px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Asistentes & QR →</Link>
                <Link href={`/admin/eventos/${id}/preguntas`} style={{ background: '#e2e8f0', color: '#0f172a', padding: '0.5rem 1rem', borderRadius: '6px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Moderación Q&A →</Link>
              </div>
            </div>
          </div>
        )}

        {/* ... Rest of tabs (tickets, agenda, config) would go here, omitting for brevity in first pass but ensuring basic edit works */}
        {activeTab === 'tickets' && (
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '1.5rem' }}>Gestión de Boletos</h2>
            <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                {tickets.map((t, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 2fr 40px', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                        <input placeholder="Nombre" value={t.nombre} onChange={(e) => updateTicket(idx, 'nombre', e.target.value)} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                        <input type="number" placeholder="Precio" value={t.precio} onChange={(e) => updateTicket(idx, 'precio', parseFloat(e.target.value))} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                        <input placeholder="Descripción" value={t.descripcion} onChange={(e) => updateTicket(idx, 'descripcion', e.target.value)} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                        <button onClick={() => setTickets(tickets.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                    </div>
                ))}
            </div>
            <button onClick={() => setTickets([...tickets, { nombre: '', precio: 0, descripcion: '' }])} style={{ background: 'white', color: '#001F3F', border: '1px solid #001F3F', padding: '0.7rem 1.5rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>+ Añadir Tipo de Boleto</button>
          </div>
        )}

        {activeTab === 'agenda' && (
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '1.5rem' }}>Agenda Dinámica</h2>
            <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                {agenda.map((item, idx) => (
                    <div key={idx} style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 40px', gap: '1.5rem', marginBottom: '1rem' }}>
                            <input type="text" placeholder="HH:MM" value={item.hora} onChange={(e) => updateAgenda(idx, 'hora', e.target.value)} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                            <input placeholder="Título" value={item.titulo} onChange={(e) => updateAgenda(idx, 'titulo', e.target.value)} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 600 }} />
                            <button onClick={() => setAgenda(agenda.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
                            <input placeholder="Ponente" value={item.ponente} onChange={(e) => updateAgenda(idx, 'ponente', e.target.value)} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                            <input placeholder="Descripción" value={item.descripcion} onChange={(e) => updateAgenda(idx, 'descripcion', e.target.value)} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={() => setAgenda([...agenda, { hora: '', titulo: '', descripcion: '', ponente: '' }])} style={{ background: 'white', color: '#001F3F', border: '1px solid #001F3F', padding: '0.7rem 1.5rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>+ Añadir Actividad</button>
          </div>
        )}

        {activeTab === 'config' && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '1rem' }}>Reglas de Registro</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Tipo de Acceso</label>
              <select name="tipo_acceso" value={formData.tipo_acceso} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <option value="libre">Libre (Gratuito)</option>
                <option value="pago">Con Costo (Pago Online)</option>
                <option value="invitacion">Por Invitación Cerrada</option>
              </select>
            </div>

            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '1rem' }}>
                <h4 style={{ fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>Acompañantes</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <input 
                        type="checkbox" 
                        id="permite_invitados" 
                        checked={config.permite_invitados} 
                        onChange={(e) => setConfig({...config, permite_invitados: e.target.checked})}
                        style={{ width: '1.2rem', height: '1.2rem' }} 
                    />
                    <label htmlFor="permite_invitados" style={{ color: '#475569' }}>Permitir invitados</label>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '200px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Máximo</label>
                    <input 
                        type="number" 
                        value={config.max_invitados} 
                        onChange={(e) => setConfig({...config, max_invitados: parseInt(e.target.value) || 0})}
                        style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} 
                    />
                </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '1rem' }}>
                <h4 style={{ fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>Límite de Asistencia (Cupo Total)</h4>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>Define el número máximo de personas que pueden registrarse al evento. Deja en 0 para cupo ilimitado.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '200px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Cupo Máximo</label>
                    <input 
                        type="number" 
                        value={config.cupo_maximo} 
                        onChange={(e) => setConfig({...config, cupo_maximo: parseInt(e.target.value) || 0})}
                        style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} 
                    />
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
