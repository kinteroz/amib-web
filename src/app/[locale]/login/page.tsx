'use client';

import React, { useState } from 'react';
import { login } from '@/lib/auth-actions';
import { MarketMatrix } from '@/components/ui/branding/MarketMatrix';
import styles from '@/components/ui/animations/animations.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email);
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Error al enviar el enlace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.fullBleedHero} style={{ height: '100vh', justifyContent: 'center' }}>
      <MarketMatrix />
      <div className={styles.grainOverlay} />
      
      <div style={{ 
        zIndex: 10, 
        background: 'rgba(255,255,255,0.02)', 
        backdropFilter: 'blur(40px)', 
        padding: '4rem', 
        borderRadius: '32px', 
        border: '1px solid rgba(255,255,255,0.08)',
        width: '100%',
        maxWidth: '480px',
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
      }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.1em', color: 'white' }}>AMIB <span style={{ opacity: 0.5, fontWeight: 400 }}>Portal</span></div>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.4, marginTop: '0.5rem', letterSpacing: '0.2em' }}>Acceso Administrativo</div>
        </div>

        {sent ? (
          <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>📩</div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'white' }}>Enlace enviado</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
              Hemos enviado un acceso directo a <strong>{email}</strong>. Por favor, revisa tu bandeja de entrada.
            </p>
            <button 
              onClick={() => setSent(false)} 
              style={{ marginTop: '2rem', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', textDecoration: 'underline', cursor: 'pointer' }}
            >
              Intentar con otro correo
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
            <div style={{ marginBottom: '2rem' }}>
              <label htmlFor="email" style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '0.75rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                Correo Electrónico
              </label>
              <input 
                type="email" 
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@amib.com.mx"
                style={{ 
                  width: '100%', 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  padding: '1.2rem', 
                  borderRadius: '12px', 
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-secondary-container)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            {error && (
              <div style={{ color: '#ff4d4f', fontSize: '0.85rem', marginBottom: '1.5rem', background: 'rgba(255,77,79,0.1)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,77,79,0.2)' }}>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                width: '100%', 
                background: loading ? 'rgba(255,255,255,0.1)' : 'var(--color-secondary-container)', 
                color: loading ? 'rgba(255,255,255,0.3)' : 'var(--color-primary)', 
                border: 'none', 
                padding: '1.2rem', 
                borderRadius: '12px', 
                fontSize: '1rem', 
                fontWeight: 700, 
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'transform 0.2s ease, filter 0.2s ease'
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.filter = 'brightness(1.1)')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.filter = 'none')}
            >
              {loading ? 'Procesando...' : 'Obtener Acceso Directo'}
            </button>

            <p style={{ marginTop: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', lineHeight: 1.5 }}>
              Este portal es de uso exclusivo para personal autorizado de la AMIB. Todas las actividades son monitoreadas.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
