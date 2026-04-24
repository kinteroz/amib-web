'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function GestorAsistentes({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const supabase = createClient();
  const [asistentes, setAsistentes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scannerData, setScannerData] = useState('');
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    fetchAsistentes();
  }, [id]);

  const fetchAsistentes = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('evento_asistentes')
      .select('*')
      .eq('evento_id', id)
      .order('fecha_registro', { ascending: false });
    
    setAsistentes(data || []);
    setLoading(false);
  };

  const toggleAsistencia = async (asistenteId: string, currentStatus: boolean) => {
    const { error } = await supabase
        .from('evento_asistentes')
        .update({ 
            asistio: !currentStatus, 
            fecha_checkin: !currentStatus ? new Date().toISOString() : null 
        })
        .eq('id', asistenteId);
    
    if (!error) {
        setAsistentes(asistentes.map(a => a.id === asistenteId ? { ...a, asistio: !currentStatus, fecha_checkin: !currentStatus ? new Date().toISOString() : null } : a));
    } else {
        alert('Error al actualizar asistencia');
    }
  };

  const handleManualScan = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!scannerData) return;

      const asis = asistentes.find(a => a.qr_code === scannerData.trim());
      if (asis) {
          if (asis.asistio) {
              alert('Este asistente YA FUE REGISTRADO previamente.');
          } else {
              await toggleAsistencia(asis.id, false);
              alert(`Check-in exitoso para: ${asis.nombre_completo}`);
          }
      } else {
          alert('Código QR no encontrado en este evento.');
      }
      setScannerData('');
  };

  const asistentesTotales = asistentes.length;
  const asistentesConfirmados = asistentes.filter(a => a.asistio).length;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Link href={`/admin/eventos/${id}/editar`} style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'inline-block' }}>
            ← Volver al Evento
          </Link>
          <h1 style={{ fontSize: '2rem', color: '#0f172a', fontWeight: 700 }}>Control de Asistencia</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ background: '#f1f5f9', padding: '0.5rem 1rem', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Total Registros</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{asistentesTotales}</div>
            </div>
            <div style={{ background: '#ecfdf5', padding: '0.5rem 1rem', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>Han Asistido</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#047857' }}>{asistentesConfirmados}</div>
            </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '2rem' }}>
          {/* Scanner Panel */}
          <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', height: 'fit-content' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '1rem' }}>Escáner de Acceso</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>Utiliza una pistola de códigos QR o la cámara del dispositivo para hacer check-in.</p>
              
              <form onSubmit={handleManualScan} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <input 
                      type="text" 
                      placeholder="Código del QR..." 
                      value={scannerData}
                      onChange={e => setScannerData(e.target.value)}
                      autoFocus
                      style={{ padding: '0.8rem', borderRadius: '8px', border: '2px solid #001F3F', outline: 'none', fontWeight: 600 }}
                  />
                  <button type="submit" style={{ background: '#001F3F', color: 'white', border: 'none', padding: '0.8rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                      Validar Entrada
                  </button>
              </form>

              <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', textAlign: 'center', cursor: 'pointer' }} onClick={() => setScanning(!scanning)}>
                  {scanning ? '📷 Apagar Cámara' : '📷 Usar Cámara del Dispositivo'}
              </div>
              {scanning && (
                  <div style={{ marginTop: '1rem', height: '200px', background: 'black', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem', textAlign: 'center' }}>
                      [Área del Escáner de Cámara]<br/>Requiere librería html5-qrcode
                  </div>
              )}
          </div>

          {/* List Panel */}
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: 600, fontSize: '0.9rem' }}>Asistente</th>
                        <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: 600, fontSize: '0.9rem' }}>Email</th>
                        <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: 600, fontSize: '0.9rem' }}>Código QR</th>
                        <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: 600, fontSize: '0.9rem' }}>Estado</th>
                        <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: 600, fontSize: '0.9rem' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</td></tr>
                    ) : asistentes.length === 0 ? (
                        <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No hay registros para este evento.</td></tr>
                    ) : (
                        asistentes.map(a => (
                            <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9', background: a.asistio ? '#f0fdf4' : 'transparent' }}>
                                <td style={{ padding: '1rem 1.5rem', fontWeight: 500, color: '#0f172a' }}>{a.nombre_completo}</td>
                                <td style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.9rem' }}>{a.email}</td>
                                <td style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.8rem', fontFamily: 'monospace' }}>{a.qr_code.substring(0, 15)}...</td>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    {a.asistio ? (
                                        <span style={{ background: '#dcfce7', color: '#166534', padding: '0.3rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>✓ Presente</span>
                                    ) : (
                                        <span style={{ background: '#f1f5f9', color: '#64748b', padding: '0.3rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>Ausente</span>
                                    )}
                                </td>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    <button 
                                        onClick={() => toggleAsistencia(a.id, a.asistio)}
                                        style={{ background: a.asistio ? '#ef4444' : '#001F3F', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                                    >
                                        {a.asistio ? 'Deshacer' : 'Check-in Manual'}
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
          </div>
      </div>
    </div>
  );
}
