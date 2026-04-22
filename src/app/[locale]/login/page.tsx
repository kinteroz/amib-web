'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { login } from '@/lib/auth-actions';
import { MarketMatrix } from '@/components/ui/branding/MarketMatrix';
import loginStyles from './login.module.css';
import { useParams } from 'next/navigation';

export default function LoginPage() {
  const { locale } = useParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { role } = await login(email, password);
      // Navegación completa (no SPA push) para que el middleware
      // lea las cookies de sesión recién escritas sin condición de carrera.
      const base = `/${locale || 'es'}`;
      window.location.href = role === 'admin' ? `${base}/admin` : `${base}/asociados/portal/dashboard`;
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Credenciales inválidas. Verifica tu correo e institucional y contraseña.');
    }
  };

  return (
    <div className={loginStyles.container}>
      {/* Left Column: Branding */}
      <div className={loginStyles.leftColumn}>
        <div className={loginStyles.brandVisual}>
          <MarketMatrix />
        </div>
        <div className={loginStyles.leftContent}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className={loginStyles.tagline}>Institutional Framework</div>
            <h1 className={loginStyles.brandingTitle}>Bursátil</h1>
            <div className={loginStyles.brandingSub}>Precision</div>
            <div className={loginStyles.divider} />
            <p className={loginStyles.description}>
              Plataforma de alta integridad para la gestión de comités y normatividad bursátil. 
              Diseñada bajo los estándares de rigor y transparencia de la AMIB.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Column: Auth Form */}
      <div className={loginStyles.rightColumn}>
        <div className={loginStyles.formWrapper}>
          <div className={loginStyles.formHeader}>
            <h2 className={loginStyles.formTitle}>Acceso Seguro</h2>
            <p className={loginStyles.formSubtitle}>Ingrese sus credenciales institucionales para continuar.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={loginStyles.inputGroup}>
              <div className={loginStyles.labelRow}>
                <label className={loginStyles.label}>Usuario Institucional</label>
              </div>
              <div className={loginStyles.inputWrapper}>
                <span className={loginStyles.inputIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 21h18M3 10h18M5 10v11M19 10v11M12 10v11M7 10l5-6 5 6" />
                  </svg>
                </span>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ej. J.Perez@amib.org.mx"
                  className={loginStyles.input}
                />
              </div>
            </div>

            <div className={loginStyles.inputGroup}>
              <div className={loginStyles.labelRow}>
                <label className={loginStyles.label}>Contraseña</label>
                <span className={loginStyles.recoverLink}>Recuperar</span>
              </div>
              <div className={loginStyles.inputWrapper}>
                <span className={loginStyles.inputIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={loginStyles.input}
                />
                <span className={loginStyles.passwordToggle} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
                </span>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={loginStyles.errorMessage}
              >
                {error}
              </motion.div>
            )}

            <button type="submit" disabled={loading} className={loginStyles.submitButton}>
              {loading ? 'Autenticando...' : 'Ingresar al Portal'}
            </button>

            <div className={loginStyles.confidentialityBox}>
              <div className={loginStyles.warningIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 11 12 14 22 4" /><path d="M12 12v6" /><line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </div>
              <div className={loginStyles.confidentialityText}>
                <strong>Aviso de Confidencialidad</strong>
                Toda la información contenida en este portal es de carácter estrictamente gremial y confidencial. El acceso no autorizado está prohibido y sujeto a regulación interna.
              </div>
            </div>
          </form>

          <div className={loginStyles.footer}>
            <div>© 2024 AMIB-Institución Financiera.</div>
            <div className={loginStyles.footerLinks}>
              <span>Privacidad</span>
              <span>Términos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
