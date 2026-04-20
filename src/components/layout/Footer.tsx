'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import styles from '@/components/ui/animations/animations.module.css';

const footerLinks = {
  institucional: {
    title: 'Institucional',
    links: [
      { label: 'Quiénes Somos', href: '/nosotros' },
      { label: 'Misión y Visión', href: '/nosotros' },
      { label: 'Consejo Directivo', href: '/nosotros' },
      { label: 'Asociados', href: '/asociados' },
      { label: 'Gobierno Corporativo', href: '/nosotros' },
    ]
  },
  servicios: {
    title: 'Servicios',
    links: [
      { label: 'Certificaciones', href: '/certificacion' },
      { label: 'Educación Financiera', href: '/educacion' },
      { label: 'Autorregulación', href: '/autorregulacion' },
      { label: 'Market Data', href: '/market' },
      { label: 'Normatividad', href: '/normatividad' },
    ]
  },
  recursos: {
    title: 'Recursos',
    links: [
      { label: 'Eventos', href: '/eventos' },
      { label: 'Noticias', href: '/noticias' },
      { label: 'Publicaciones', href: '/publicaciones' },
      { label: 'Bolsa de Trabajo', href: '/bolsa-trabajo' },
      { label: 'Preguntas Frecuentes', href: '/faq' },
    ]
  },
};

const socialLinks = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/amib/', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
  )},
  { label: 'X (Twitter)', href: 'https://twitter.com/AMABORSAMX', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
  )},
  { label: 'Facebook', href: 'https://www.facebook.com/AMIB.MX', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
  )},
  { label: 'YouTube', href: 'https://www.youtube.com/@AMIB_MX', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/><polygon fill="var(--color-primary-container)" points="9.545,15.568 15.818,12 9.545,8.432"/></svg>
  )},
];

export function Footer() {
  return (
    <footer style={{
      position: 'relative',
      width: '100%',
      background: 'linear-gradient(to bottom, var(--color-primary-container), rgba(0, 5, 15, 1))',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      zIndex: 20,
    }}>
      {/* Decorative top line */}
      <div style={{
        width: '100%',
        height: '2px',
        background: 'linear-gradient(to right, transparent, var(--color-secondary-container), transparent)',
      }} />

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '4rem 5% 2rem 5%',
      }}>
        {/* Top: Brand + Columns */}
        <div className={styles.footerGrid}>
          {/* Brand Column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'var(--color-secondary-container)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '0.9rem',
                color: 'var(--color-primary)',
              }}>
                AMIB
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'white', letterSpacing: '-0.02em' }}>AMIB</div>
                <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Asociación Mexicana de Instituciones Bursátiles</div>
              </div>
            </div>
            
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: '1.5rem', maxWidth: '320px' }}>
              Promovemos el desarrollo sano y competitivo del mercado de valores en México, 
              fortaleciendo la confianza de los inversionistas y la integridad del sistema financiero.
            </p>

            {/* Contact Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                <span style={{ marginTop: '2px' }}>📍</span>
                <span>Paseo de la Reforma 255, Piso 1<br/>Col. Cuauhtémoc, C.P. 06500<br/>Ciudad de México</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                <span>📞</span>
                <span>+52 (55) 5726 6600</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                <span>✉️</span>
                <span>contacto@amib.com.mx</span>
              </div>
            </div>
          </div>

          {/* Link Columns */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h4 style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                color: 'var(--color-secondary-container)',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                marginBottom: '1.5rem',
              }}>
                {section.title}
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href}
                      style={{
                        color: 'rgba(255,255,255,0.5)',
                        textDecoration: 'none',
                        fontSize: '0.85rem',
                        transition: 'color 0.2s ease',
                        fontWeight: 500,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'white')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '2rem' }} />

        {/* Bottom: Social + Legal */}
        <div className={styles.footerBottom}>
          {/* Social Links */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {socialLinks.map((social) => (
              <motion.a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(255,255,255,0.5)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-secondary-container)';
                  e.currentTarget.style.color = 'var(--color-primary)';
                  e.currentTarget.style.borderColor = 'var(--color-secondary-container)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                }}
                title={social.label}
              >
                {social.icon}
              </motion.a>
            ))}
          </div>

          {/* Legal Links */}
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/aviso-privacidad" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 500 }}>
              Aviso de Privacidad
            </Link>
            <Link href="/terminos" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 500 }}>
              Términos y Condiciones
            </Link>
            <Link href="/mapa-sitio" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 500 }}>
              Mapa de Sitio
            </Link>
          </div>

          {/* Copyright */}
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>
            © {new Date().getFullYear()} AMIB. Todos los derechos reservados.
          </div>
        </div>
      </div>
    </footer>
  );
}
