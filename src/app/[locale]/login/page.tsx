'use client';

import React, { useState } from 'react';
import { login } from '@/lib/auth-actions';
import { MarketMatrix } from '@/components/ui/branding/MarketMatrix';
import styles from '@/components/ui/animations/animations.module.css';
import { useRouter, useParams } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const { locale } = useParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      router.push(`/${locale || 'es'}/admin`);
    } catch (err: any) {
      setError(err.message || 'Credenciales inválidas. Verifica tu correo y contraseña.');
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

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '1.5rem' }}>
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
                padding: '1rem', 
                borderRadius: '12px', 
                color: 'white',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label htmlFor="password" style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '0.75rem', fontWeight: 600, letterSpacing: '0.05em' }}>
              Contraseña
            </label>
            <input 
              type="password" 
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ 
                width: '100%', 
                background: 'rgba(255,255,255,0.05)', 
                border: '1px solid rgba(255,255,255,0.1)', 
                padding: '1rem', 
                borderRadius: '12px', 
                color: 'white',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }}
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
          >
            {loading ? 'Validando...' : 'Iniciar Sesión'}
          </button>

          <p style={{ marginTop: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', lineHeight: 1.5 }}>
            Este portal es de uso exclusivo para personal autorizado de la AMIB. Todas las actividades son monitoreadas.
          </p>
        </form>
      </div>
    </div>
  );
}
