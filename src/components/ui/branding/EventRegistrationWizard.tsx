'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/animations/Skeleton';
import { Database } from '@/types/database.types';

type Evento = Database['public']['Tables']['eventos']['Row'] & {
    configuracion_registro?: any;
};
type Ticket = Database['public']['Tables']['evento_tickets']['Row'];

interface EventRegistrationWizardProps {
  evento: Evento;
  tickets: Ticket[];
}

export function EventRegistrationWizard({ evento, tickets }: EventRegistrationWizardProps) {
  const [step, setStep] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(tickets.length === 1 ? tickets[0] : null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    institucion: '',
    cargo: '',
    invitados: [] as { nombre: string; email: string; cargo: string }[]
  });

  const config = (evento as any).configuracion_registro || { permite_invitados: false, max_invitados: 0 };
  const maxInvitados = config.max_invitados || 0;

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGuestChange = (index: number, field: string, value: string) => {
    const newGuests = [...formData.invitados];
    newGuests[index] = { ...newGuests[index], [field]: value };
    setFormData({ ...formData, invitados: newGuests });
  };

  const addGuest = () => {
    if (formData.invitados.length < maxInvitados) {
      setFormData({ ...formData, invitados: [...formData.invitados, { nombre: '', email: '', cargo: '' }] });
    }
  };

  const removeGuest = (index: number) => {
    const newGuests = formData.invitados.filter((_, i) => i !== index);
    setFormData({ ...formData, invitados: newGuests });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
          >
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary-container)' }}>Selecciona tu Acceso</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {tickets.length > 0 ? tickets.map(ticket => (
                <div 
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  style={{ 
                    padding: '2rem', 
                    borderRadius: '16px', 
                    border: `2px solid ${selectedTicket?.id === ticket.id ? 'var(--color-secondary-container)' : 'rgba(0,0,0,0.05)'}`,
                    cursor: 'pointer',
                    background: selectedTicket?.id === ticket.id ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.5)',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-primary-container)' }}>{ticket.nombre}</h4>
                      <p style={{ fontSize: '0.9rem', opacity: 0.7, color: 'var(--color-primary-container)' }}>{ticket.descripcion || 'Acceso completo al evento'}</p>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                      {ticket.precio && ticket.precio > 0 ? `$${ticket.precio} MXN` : 'Gratis'}
                    </div>
                  </div>
                </div>
              )) : (
                <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>No hay boletos disponibles configurados.</div>
              )}
            </div>
            <button 
              disabled={!selectedTicket}
              onClick={nextStep}
              style={{ padding: '1.2rem', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', marginTop: '1rem', opacity: !selectedTicket ? 0.5 : 1 }}
            >
              Continuar con el Registro
            </button>
          </motion.div>
        );

      case 2:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
          >
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary-container)' }}>Tus Datos</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary-container)' }}>Nombre Completo</label>
                <input name="nombre" value={formData.nombre} onChange={handleInputChange} style={{ padding: '1rem', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)' }} placeholder="Ej: Juan Pérez" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary-container)' }}>Email Corporativo</label>
                <input name="email" value={formData.email} onChange={handleInputChange} style={{ padding: '1rem', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)' }} placeholder="juan@institucion.com" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary-container)' }}>Institución</label>
                <input name="institucion" value={formData.institucion} onChange={handleInputChange} style={{ padding: '1rem', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)' }} placeholder="Nombre de tu Casa de Bolsa / Empresa" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary-container)' }}>Cargo</label>
                <input name="cargo" value={formData.cargo} onChange={handleInputChange} style={{ padding: '1rem', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)' }} placeholder="Ej: CISO, Director, etc." />
              </div>
            </div>

            {config.permite_invitados && (
                <div style={{ marginTop: '1rem', padding: '2rem', background: 'rgba(0,0,0,0.02)', borderRadius: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h4 style={{ fontWeight: 700, color: 'var(--color-primary-container)' }}>Acompañantes / Invitados ({formData.invitados.length}/{maxInvitados})</h4>
                        {formData.invitados.length < maxInvitados && (
                            <button onClick={addGuest} style={{ background: 'var(--color-secondary-container)', color: 'var(--color-primary)', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>+ Añadir Invitado</button>
                        )}
                    </div>
                    {formData.invitados.map((guest, idx) => (
                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 40px', gap: '1rem', marginBottom: '1rem', alignItems: 'end' }}>
                            <input placeholder="Nombre" value={guest.nombre} onChange={(e) => handleGuestChange(idx, 'nombre', e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.05)' }} />
                            <input placeholder="Email" value={guest.email} onChange={(e) => handleGuestChange(idx, 'email', e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.05)' }} />
                            <input placeholder="Cargo" value={guest.cargo} onChange={(e) => handleGuestChange(idx, 'cargo', e.target.value)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.05)' }} />
                            <button onClick={() => removeGuest(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                        </div>
                    ))}
                </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button onClick={prevStep} style={{ flex: 1, padding: '1.2rem', background: 'white', color: 'var(--color-primary)', border: '1px solid var(--color-primary)', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Atrás</button>
                <button onClick={nextStep} style={{ flex: 2, padding: '1.2rem', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Confirmar y Proceder</button>
            </div>
          </motion.div>
        );

      case 3:
        if (evento.tipo_acceso === 'pago') {
            return (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ textAlign: 'center' }}
                >
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem', color: 'var(--color-primary-container)' }}>Pago Seguro</h3>
                    <div style={{ maxWidth: '400px', margin: '0 auto', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '2.5rem', borderRadius: '24px', color: 'white', textAlign: 'left', marginBottom: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                        <div style={{ marginBottom: '2rem', opacity: 0.6, fontSize: '0.8rem', letterSpacing: '0.1em' }}>TARJETA DE DÉBITO / CRÉDITO</div>
                        <div style={{ fontSize: '1.4rem', letterSpacing: '0.2em', marginBottom: '2rem' }}>•••• •••• •••• ••••</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '0.6rem', opacity: 0.5, marginBottom: '2px' }}>NOMBRE EN TARJETA</div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{formData.nombre || 'NOMBRE COMPLETO'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.6rem', opacity: 0.5, marginBottom: '2px' }}>EXPIRACIÓN</div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>MM/YY</div>
                            </div>
                        </div>
                    </div>
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ fontSize: '1.1rem', opacity: 0.7, color: 'var(--color-primary-container)' }}>Total a Pagar:</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>${selectedTicket?.precio} MXN</div>
                    </div>
                    <button onClick={nextStep} style={{ width: '100%', padding: '1.2rem', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Pagar Ahora</button>
                </motion.div>
            )
        }
        
        // Final success state (skipped to confirm for free/invitation)
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: 'center', padding: '3rem' }}
            >
                <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>✅</div>
                <h3 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--color-primary-container)' }}>
                    {evento.tipo_acceso === 'invitacion' ? 'Solicitud Recibida' : '¡Registro Exitoso!'}
                </h3>
                <p style={{ opacity: 0.7, maxWidth: '500px', margin: '0 auto 3rem auto', lineHeight: 1.6, color: 'var(--color-primary-container)' }}>
                    {evento.tipo_acceso === 'invitacion' 
                        ? 'Tu solicitud para asistir al evento ha sido enviada al comité organizador. Recibirás un correo con la confirmación una vez validada.' 
                        : `Hemos enviado tus boletos y el código QR de acceso al correo: ${formData.email}`}
                </p>
                <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)', display: 'inline-block' }}>
                    <div style={{ width: '200px', height: '200px', background: 'rgba(0,0,0,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                        <div style={{ opacity: 0.1, fontSize: '4rem' }}>QR</div>
                    </div>
                    <div style={{ marginTop: '1.5rem', textAlign: 'left' }}>
                        <div style={{ fontSize: '0.8rem', opacity: 0.6, color: 'var(--color-primary-container)' }}>EVENTO</div>
                        <div style={{ fontWeight: 700, color: 'var(--color-primary-container)' }}>{evento.titulo}</div>
                    </div>
                </div>
                <div style={{ marginTop: '3rem' }}>
                    <a href="/" style={{ color: 'var(--color-primary)', fontWeight: 700, borderBottom: '2px solid var(--color-secondary-container)' }}>Volver al Inicio</a>
                </div>
            </motion.div>
        );

      case 4: // Only reached by paid events after step 3
        return (
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                style={{ textAlign: 'center', padding: '3rem' }}
            >
                <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>💰 ¡Pago Confirmado!</div>
                <h3 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--color-primary-container)' }}>Tu lugar está reservado</h3>
                <p style={{ opacity: 0.7, maxWidth: '500px', margin: '0 auto 3rem auto', lineHeight: 1.6, color: 'var(--color-primary-container)' }}>
                    Tu transacción por ${selectedTicket?.precio} ha sido exitosa. Hemos enviado tu comprobante fiscal y tus boletos a {formData.email}.
                </p>
                <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)', display: 'inline-block' }}>
                    <div style={{ width: '200px', height: '200px', background: 'rgba(0,0,0,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                        <div style={{ opacity: 0.2, fontSize: '4rem' }}>QR</div>
                    </div>
                    <div style={{ marginTop: '1.5rem', textAlign: 'left' }}>
                        <div style={{ fontSize: '0.8rem', opacity: 0.6, color: 'var(--color-primary-container)' }}>EVENTO / BOLETO</div>
                        <div style={{ fontWeight: 700, color: 'var(--color-primary-container)' }}>{evento.titulo} - {selectedTicket?.nombre}</div>
                    </div>
                </div>
                <div style={{ marginTop: '3rem' }}>
                    <a href="/" style={{ color: 'var(--color-primary)', fontWeight: 700, borderBottom: '2px solid var(--color-secondary-container)' }}>Volver al Inicio</a>
                </div>
            </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '4rem auto', zIndex: 10, position: 'relative' }}>
      
      {/* Progress Marker */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginBottom: '4rem' }}>
         {[1, 2, 3].map(i => (
             <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                 <div style={{ 
                     width: '32px', 
                     height: '32px', 
                     borderRadius: '50%', 
                     display: 'flex', 
                     alignItems: 'center', 
                     justifyContent: 'center',
                     fontWeight: 700,
                     background: step >= i ? 'var(--color-primary)' : 'rgba(0,0,0,0.05)',
                     color: step >= i ? 'white' : 'inherit',
                     fontSize: '0.8rem'
                 }}>{i}</div>
                 <div style={{ fontSize: '0.75rem', fontWeight: 700, opacity: step === i ? 1 : 0.5, color: 'white', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                     {i === 1 ? 'Acceso' : i === 2 ? 'Datos' : 'Pago / Confirmación'}
                 </div>
             </div>
         ))}
      </div>

      <div style={{ 
        background: 'rgba(255, 255, 255, 0.8)', 
        backdropFilter: 'blur(20px)', 
        borderRadius: '32px', 
        padding: '4rem',
        boxShadow: '0 40px 100px rgba(0,20,45, 0.1)',
        border: '1px solid rgba(255, 255, 255, 1)'
      }}>
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>

    </div>
  );
}
