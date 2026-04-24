'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function NuevoEvento() {
  const router = useRouter();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  
  // States for main data
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

  // State for dynamic features
  const [tickets, setTickets] = useState<any[]>([{ nombre: 'General', precio: 0, descripcion: 'Acceso completo' }]);
  const [agenda, setAgenda] = useState<any[]>([{ hora: '09:00', titulo: 'Registro y Bienvenida', descripcion: '', ponente: '' }]);
  const [config, setConfig] = useState({
    permite_invitados: false,
    max_invitados: 0,
    cupo_maximo: 0
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const val = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: val });
  };

  const addTicket = () => setTickets([...tickets, { nombre: '', precio: 0, descripcion: '' }]);
  const updateTicket = (idx: number, field: string, val: any) => {
    const newItems = [...tickets];
    newItems[idx] = { ...newItems[idx], [field]: val };
    setTickets(newItems);
  };

  const addAgendaItem = () => setAgenda([...agenda, { hora: '', titulo: '', descripcion: '', ponente: '' }]);
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
        // 1. Insert Event
        const { data: eventData, error: eventError } = await (supabase
            .from('eventos' as any) as any)
            .insert([{
                ...formData,
                agenda_json: agenda,
                configuracion_registro: config
            }])
            .select();

        if (eventError) throw eventError;

        const newEventId = eventData[0].id;

        // 2. Insert Tickets if any
        if (tickets.length > 0) {
            const ticketsToSave = tickets.map(t => ({ ...t, evento_id: newEventId }));
            const { error: ticketsError } = await (supabase
                .from('evento_tickets' as any) as any)
                .insert(ticketsToSave);
            
            if (ticketsError) throw ticketsError;
        }

        alert('Evento creado exitosamente');
        router.push('/admin/eventos');
    } catch (err) {
        console.error(err);
        alert('Error al guardar el evento. Revisa la consola.');
    } finally {
        setSaving(false);
    }
  };

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
          <h1 style={{ fontSize: '2rem', color: '#0f172a', fontWeight: 700 }}>Crear Nuevo Evento</h1>
        </div>
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
          {saving ? 'Guardando...' : 'Guardar Evento'}
        </button>
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

      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        
        {activeTab === 'general' && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '1rem' }}>Detalles Básicos</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Título del Evento</label>
              <input name="titulo" value={formData.titulo} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} placeholder="Ej: Foro Anual AMIB 2026" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Descripción</label>
              <textarea name="descripcion" value={formData.descripcion} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', minHeight: '100px' }} placeholder="Breve resumen del evento..." />
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
                <input name="ubicacion" value={formData.ubicacion} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} placeholder="Hotel Marquis Reforma / Enlace Zoom" />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>URL de Imagen de Fondo (Full-bleed)</label>
                <input name="imagen_url" value={formData.imagen_url} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} placeholder="https://images.unsplash.com/..." />
                <p style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Se recomienda una imagen horizontal de alta resolución (1920x1080+).</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                <input type="checkbox" name="es_destacado" id="es_destacado" checked={formData.es_destacado} onChange={handleInputChange} style={{ width: '1.2rem', height: '1.2rem' }} />
                <label htmlFor="es_destacado" style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>Destacar este evento (Aparecerá en el slider full-bleed del portal)</label>
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
            
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '1rem' }}>
                Nota: Podrás añadir Ponentes, Galería, Escanear QR y gestionar Q&A después de guardar el evento por primera vez, desde la vista de Edición.
            </p>
          </div>
        )}

        {activeTab === 'tickets' && (
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '1.5rem' }}>Gestión de Boletos</h2>
            <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                {tickets.map((t, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 2fr 40px', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                        <input placeholder="Nombre (ej: VIP)" value={t.nombre} onChange={(e) => updateTicket(idx, 'nombre', e.target.value)} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                        <input type="number" placeholder="Precio" value={t.precio} onChange={(e) => updateTicket(idx, 'precio', parseFloat(e.target.value))} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                        <input placeholder="Descripción breve" value={t.descripcion} onChange={(e) => updateTicket(idx, 'descripcion', e.target.value)} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                        <button onClick={() => setTickets(tickets.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                    </div>
                ))}
            </div>
            <button onClick={addTicket} style={{ background: 'white', color: '#001F3F', border: '1px solid #001F3F', padding: '0.7rem 1.5rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>+ Añadir Tipo de Boleto</button>
          </div>
        )}

        {activeTab === 'agenda' && (
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '1.5rem' }}>Agenda Dinámica (Sesiones)</h2>
            <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                {agenda.map((item, idx) => (
                    <div key={idx} style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 40px', gap: '1.5rem', marginBottom: '1rem' }}>
                            <input type="text" placeholder="HH:MM" value={item.hora} onChange={(e) => updateAgenda(idx, 'hora', e.target.value)} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                            <input placeholder="Título de la Sesión" value={item.titulo} onChange={(e) => updateAgenda(idx, 'titulo', e.target.value)} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 600 }} />
                            <button onClick={() => setAgenda(agenda.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
                            <input placeholder="Ponente" value={item.ponente} onChange={(e) => updateAgenda(idx, 'ponente', e.target.value)} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                            <input placeholder="Descripción (opcional)" value={item.descripcion} onChange={(e) => updateAgenda(idx, 'descripcion', e.target.value)} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={addAgendaItem} style={{ background: 'white', color: '#001F3F', border: '1px solid #001F3F', padding: '0.7rem 1.5rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>+ Añadir Actividad</button>
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
                <h4 style={{ fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>Configuración de Acompañantes</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <input 
                        type="checkbox" 
                        id="permite_invitados" 
                        checked={config.permite_invitados} 
                        onChange={(e) => setConfig({...config, permite_invitados: e.target.checked})}
                        style={{ width: '1.2rem', height: '1.2rem' }} 
                    />
                    <label htmlFor="permite_invitados" style={{ color: '#475569' }}>Permitir que el usuario registre invitados/acompañantes extras</label>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '200px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Máximo por registro</label>
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
