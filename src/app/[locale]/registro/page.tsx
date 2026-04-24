'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { registerCertificado } from '@/app/actions/auth';
import { MarketMatrix } from '@/components/ui/branding/MarketMatrix';
import loginStyles from '../login/login.module.css';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';

export default function RegistroPage() {
  const { locale } = useParams();
  const [form, setForm] = useState({
    email: '',
    password: '',
    nombre: '',
    institucion: '',
    telefono: '',
    matricula: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await registerCertificado(form);
      setSuccess(true);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Error al crear la cuenta. Intente de nuevo.');
    }
  };

  if (success) {
    return (
      <div className={loginStyles.container}>
        <div className={loginStyles.leftColumn}>
          <div className={loginStyles.brandVisual}><MarketMatrix /></div>
          <div className={loginStyles.leftContent}>
            <div className={loginStyles.tagline}>Cuenta Creada</div>
            <h1 className={loginStyles.brandingTitle}>¡Bienvenido!</h1>
          </div>
        </div>
        <div className={loginStyles.rightColumn} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className={loginStyles.formWrapper} style={{ textAlign: 'center' }}>
             <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📧</div>
             <h2 className={loginStyles.formTitle}>Verifica tu correo</h2>
             <p className={loginStyles.formSubtitle} style={{ marginBottom: '2.5rem' }}>
               Hemos enviado un enlace de confirmación a <strong>{form.email}</strong>. 
               Por favor verifica tu bandeja de entrada para activar tu cuenta.
             </p>
             <Link href="/login" className={loginStyles.submitButton} style={{ display: 'inline-block', textDecoration: 'none' }}>
               Ir al Inicio de Sesión
             </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={loginStyles.container}>
      {/* Left Column: Branding */}
      <div className={loginStyles.leftColumn}>
        <div className={loginStyles.brandVisual}>
          <MarketMatrix />
        </div>
        <div className={loginStyles.leftContent}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className={loginStyles.tagline}>Portal Certificados</div>
            <h1 className={loginStyles.brandingTitle}>Registro</h1>
            <div className={loginStyles.brandingSub}>Estudiantes</div>
            <div className={loginStyles.divider} />
            <p className={loginStyles.description}>
              Únete a la comunidad de profesionales certificados de la AMIB. 
              Accede a tus puntos de renovación, exámenes y eventos institucionales.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Column: Registration Form */}
      <div className={loginStyles.rightColumn}>
        <div className={loginStyles.formWrapper}>
          <div className={loginStyles.formHeader}>
            <h2 className={loginStyles.formTitle}>Crear Cuenta</h2>
            <p className={loginStyles.formSubtitle}>Ingresa tus datos para crear tu cuenta. Los campos con * son requeridos.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={loginStyles.inputGroup}>
              <label className={loginStyles.label}>Nombre Completo *</label>
              <div className={loginStyles.inputWrapper}>
                <input 
                  type="text" 
                  required
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej. Juan Pérez"
                  className={loginStyles.input}
                />
              </div>
            </div>

            <div className={loginStyles.inputGroup}>
              <label className={loginStyles.label}>Correo Electrónico *</label>
              <div className={loginStyles.inputWrapper}>
                <input 
                  type="email" 
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="correo@ejemplo.com"
                  className={loginStyles.input}
                />
              </div>
            </div>

            <div className={loginStyles.inputGroup}>
              <label className={loginStyles.label}>Institución / Universidad *</label>
              <div className={loginStyles.inputWrapper}>
                <input 
                  type="text" 
                  required
                  value={form.institucion}
                  onChange={(e) => setForm({ ...form, institucion: e.target.value })}
                  placeholder="Nombre de tu institución"
                  className={loginStyles.input}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className={loginStyles.inputGroup}>
                <label className={loginStyles.label}>Matrícula AMIB</label>
                <div className={loginStyles.inputWrapper}>
                  <input 
                    type="text" 
                    value={form.matricula}
                    onChange={(e) => setForm({ ...form, matricula: e.target.value })}
                    placeholder="Opcional"
                    className={loginStyles.input}
                  />
                </div>
              </div>

              <div className={loginStyles.inputGroup}>
                <label className={loginStyles.label}>Teléfono</label>
                <div className={loginStyles.inputWrapper}>
                  <input 
                    type="tel" 
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    placeholder="Opcional"
                    className={loginStyles.input}
                  />
                </div>
              </div>
            </div>

            <div className={loginStyles.inputGroup}>
              <div className={loginStyles.labelRow}>
                <label className={loginStyles.label}>Contraseña *</label>
              </div>
              <div className={loginStyles.inputWrapper}>
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className={loginStyles.input}
                />
                <span className={loginStyles.passwordToggle} onClick={() => setShowPassword(!showPassword)}>
                   {showPassword ? '🙈' : '👁️'}
                </span>
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={loginStyles.errorMessage}>
                {error}
              </motion.div>
            )}

            <button type="submit" disabled={loading} className={loginStyles.submitButton}>
              {loading ? 'Creando cuenta...' : 'Registrarme'}
            </button>

            <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8' }}>
              ¿Ya tienes cuenta? <Link href="/login" style={{ color: '#EAAB00', fontWeight: 800, textDecoration: 'none', borderBottom: '1px solid rgba(234,171,0,0.3)' }}>Inicia sesión</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
