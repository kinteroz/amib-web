'use client';

import React, { useState, useEffect, useCallback } from 'react';

type Rol = 'admin' | 'asociado' | 'certificado' | 'responsable_comite' | 'encargado_catedra' | 'profesor';

interface Usuario {
  id: string;
  email: string;
  role: Rol | null;
  nombre: string | null;
  institucion: string | null;
  telefono: string | null;
  matricula: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
}

const ROL_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  admin:              { label: 'Admin CMS',  bg: '#fef3c7', color: '#92400e' },
  asociado:           { label: 'Asociado',   bg: '#dbeafe', color: '#1e40af' },
  certificado:        { label: 'Certificado', bg: '#dcfce7', color: '#166534' },
  responsable_comite: { label: 'Responsable Comité', bg: '#f3e8ff', color: '#6b21a8' },
  encargado_catedra:  { label: 'Encargado Cátedra', bg: '#e0e7ff', color: '#3730a3' },
  profesor:           { label: 'Profesor', bg: '#ffedd5', color: '#9a3412' },
};

const sinRol = { label: 'Sin rol', bg: '#f1f5f9', color: '#64748b' };

function RolBadge({ role }: { role: Rol | null }) {
  const cfg = (role && ROL_LABELS[role]) || sinRol;
  return (
    <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '4px', background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

const emptyForm = { email: '', password: '', role: 'asociado' as Rol, nombre: '', institucion: '' };

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroRol, setFiltroRol] = useState<Rol | 'todos'>('todos');
  const [busqueda, setBusqueda] = useState('');

  // Modal crear
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Edición inline de rol
  const [editingRol, setEditingRol] = useState<string | null>(null);
  const [editingRolValue, setEditingRolValue] = useState<Rol>('asociado');

  // Confirmación de borrado
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/usuarios');
    const data = await res.json();
    setUsuarios(data.users ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsuarios(); }, [fetchUsuarios]);

  const filtrados = usuarios.filter(u => {
    const matchRol = filtroRol === 'todos' || u.role === filtroRol;
    const matchBusqueda = !busqueda ||
      u.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.institucion?.toLowerCase().includes(busqueda.toLowerCase());
    return matchRol && matchBusqueda;
  });

  const crearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    const res = await fetch('/api/admin/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setFormError(data.error); return; }
    setShowModal(false);
    setForm(emptyForm);
    fetchUsuarios();
  };

  const guardarRol = async (id: string) => {
    await fetch('/api/admin/usuarios', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, role: editingRolValue }),
    });
    setEditingRol(null);
    fetchUsuarios();
  };

  const eliminarUsuario = async (id: string) => {
    await fetch('/api/admin/usuarios', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setDeletingId(null);
    fetchUsuarios();
  };

  const contadores = {
    total:       usuarios.length,
    admin:       usuarios.filter(u => u.role === 'admin').length,
    asociado:    usuarios.filter(u => u.role === 'asociado').length,
    certificado: usuarios.filter(u => u.role === 'certificado').length,
    sinRol:      usuarios.filter(u => !u.role).length,
  };

  return (
    <div>
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#0f172a', fontWeight: 700 }}>Gestión de Usuarios</h1>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Administra accesos, roles e instituciones del sistema.</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setFormError(null); setForm(emptyForm); }}
          style={{ background: '#001F3F', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          + Crear Usuario
        </button>
      </header>

      {/* Métricas rápidas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total',        value: contadores.total,       color: '#001F3F' },
          { label: 'Admins',       value: contadores.admin,       color: '#92400e' },
          { label: 'Asociados',    value: contadores.asociado,    color: '#1e40af' },
          { label: 'Certificados', value: contadores.certificado, color: '#166534' },
          { label: 'Sin rol',      value: contadores.sinRol,      color: '#64748b' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'white', padding: '1.25rem 1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por email, nombre o institución..."
          style={{ flex: 1, padding: '0.7rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', color: '#1e293b' }}
        />
        <select
          value={filtroRol}
          onChange={e => setFiltroRol(e.target.value as Rol | 'todos')}
          style={{ padding: '0.7rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', fontSize: '0.9rem', color: '#1e293b' }}
        >
          <option value="todos">Todos los roles</option>
          <option value="admin">Admin CMS</option>
          <option value="encargado_catedra">Encargado Cátedra</option>
          <option value="profesor">Profesor</option>
          <option value="asociado">Asociado</option>
          <option value="certificado">Certificado</option>
          <option value="responsable_comite">Resp. Comité</option>
        </select>
      </div>

      {/* Tabla */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {['Usuario', 'Rol', 'Institución', 'Matrícula', 'Teléfono', 'Verificado', 'Acciones'].map(h => (
                <th key={h} style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>Cargando usuarios...</td></tr>
            ) : filtrados.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8' }}>Sin resultados.</td></tr>
            ) : filtrados.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                {/* Usuario */}
                <td style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>{u.nombre || '—'}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{u.email}</div>
                </td>

                {/* Rol — edición inline */}
                <td style={{ padding: '1rem 1.25rem' }}>
                  {editingRol === u.id ? (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <select
                        value={editingRolValue}
                        onChange={e => setEditingRolValue(e.target.value as Rol)}
                        autoFocus
                        style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem', color: '#1e293b' }}
                      >
                        <option value="admin">Admin CMS</option>
                        <option value="encargado_catedra">Encargado Cátedra</option>
                        <option value="profesor">Profesor</option>
                        <option value="asociado">Asociado</option>
                        <option value="certificado">Certificado</option>
                        <option value="responsable_comite">Resp. Comité</option>
                      </select>
                      <button onClick={() => guardarRol(u.id)} style={{ background: '#001F3F', color: 'white', border: 'none', padding: '0.3rem 0.7rem', borderRadius: '5px', cursor: 'pointer', fontSize: '0.75rem' }}>✓</button>
                      <button onClick={() => setEditingRol(null)} style={{ background: 'none', border: '1px solid #e2e8f0', padding: '0.3rem 0.7rem', borderRadius: '5px', cursor: 'pointer', fontSize: '0.75rem' }}>✕</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingRol(u.id); setEditingRolValue(u.role ?? 'asociado'); }}
                      title="Haz clic para cambiar el rol"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      <RolBadge role={u.role} />
                    </button>
                  )}
                </td>

                {/* Institución */}
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#475569' }}>
                  {u.institucion || <span style={{ color: '#cbd5e1' }}>—</span>}
                </td>

                {/* Matrícula */}
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#475569', fontFamily: 'monospace' }}>
                  {u.matricula || <span style={{ color: '#cbd5e1' }}>—</span>}
                </td>

                {/* Teléfono */}
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#475569' }}>
                  {u.telefono || <span style={{ color: '#cbd5e1' }}>—</span>}
                </td>

                {/* Verificado */}
                <td style={{ padding: '1rem 1.25rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '4px', background: u.email_confirmed_at ? '#dcfce7' : '#fef3c7', color: u.email_confirmed_at ? '#166534' : '#92400e' }}>
                    {u.email_confirmed_at ? 'Confirmado' : 'Pendiente'}
                  </span>
                </td>

                {/* Último acceso */}
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                  {u.last_sign_in_at
                    ? new Date(u.last_sign_in_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
                    : 'Nunca'}
                </td>



                {/* Acciones */}
                <td style={{ padding: '1rem 1.25rem' }}>
                  {deletingId === u.id ? (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>¿Eliminar?</span>
                      <button onClick={() => eliminarUsuario(u.id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '5px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600 }}>Sí</button>
                      <button onClick={() => setDeletingId(null)} style={{ background: 'none', border: '1px solid #e2e8f0', padding: '0.3rem 0.6rem', borderRadius: '5px', cursor: 'pointer', fontSize: '0.72rem' }}>No</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeletingId(u.id)}
                      style={{ background: 'none', border: '1px solid #fecaca', color: '#ef4444', padding: '0.35rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                    >
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Crear Usuario */}
      {showModal && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
        >
          <div style={{ background: 'white', borderRadius: '20px', padding: '2.5rem', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>Crear Nuevo Usuario</h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.4rem' }}>El usuario recibirá acceso inmediato según el rol asignado.</p>
            </div>

            <form onSubmit={crearUsuario} style={{ display: 'grid', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Nombre completo</label>
                <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Ej. Juan Pérez García" style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Correo electrónico *</label>
                <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="correo@institucion.com" style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Contraseña temporal *</label>
                <input type="password" required minLength={8} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Mínimo 8 caracteres" style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'grid', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Rol *</label>
                  <select required value={form.role} onChange={e => setForm({ ...form, role: e.target.value as Rol })} style={inputStyle}>
                    <option value="certificado">Certificado</option>
                    <option value="asociado">Asociado</option>
                    <option value="responsable_comite">Responsable Comité (AMIB)</option>
                    <option value="encargado_catedra">Encargado Cátedra</option>
                    <option value="profesor">Profesor</option>
                    <option value="admin">Admin CMS</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Institución</label>
                  <input value={form.institucion} onChange={e => setForm({ ...form, institucion: e.target.value })} placeholder="Casa de Bolsa / AMIB" style={inputStyle} />
                </div>
              </div>

              {formError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.75rem 1rem', color: '#dc2626', fontSize: '0.85rem' }}>
                  {formError}
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: 600, color: '#475569' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={saving} style={{ padding: '0.75rem 1.75rem', borderRadius: '8px', border: 'none', background: '#001F3F', color: 'white', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700, opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Creando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '0.7rem 0.9rem',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  fontSize: '0.9rem',
  background: 'white',
  color: '#0f172a',
  width: '100%',
  boxSizing: 'border-box',
};
