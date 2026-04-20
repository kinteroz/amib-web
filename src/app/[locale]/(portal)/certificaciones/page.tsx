import { getTranslations } from 'next-intl/server';
import { InteractiveSpotlightBackground } from '@/components/ui/animations/InteractiveSpotlightBackground';
import { StackedSection } from '@/components/ui/animations/StackedSection';
import { createClient } from '@/lib/supabase/server';
import styles from '@/components/ui/animations/animations.module.css';
import { Database } from '@/types/database.types';

type Certificacion = Database['public']['Tables']['certificaciones']['Row'];

export default async function CertificacionesPage() {
  const t = await getTranslations('HomePage');
  const supabase = await createClient();

  const { data: certificaciones } = await supabase
    .from('certificaciones')
    .select('*')
    .eq('activo', true)
    .order('orden', { ascending: true });

  const typedCerts = (certificaciones || []) as Certificacion[];
  const total = typedCerts.length;
  const mainCerts = typedCerts.slice(0, 3);

  return (
    <InteractiveSpotlightBackground>
      <main>
        {/* Phase 1: Stacked Section for Top 3 Certifications */}
        {mainCerts.map((cert, index) => (
          <StackedSection key={cert.id} index={index} totalSections={total + 1}>
            <div className={styles.glassCard}>
              <span style={{ color: 'var(--color-secondary-container)', fontWeight: 600, letterSpacing: '0.05em', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                Certificación Destacada
              </span>
              <h1 style={{ fontSize: '3.5rem', lineHeight: 1.1, marginTop: '1rem', marginBottom: '2rem' }}>
                {cert.nombre} ({cert.codigo})
              </h1>
              <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.8)', maxWidth: '700px', lineHeight: 1.6 }}>
                {cert.descripcion}
              </p>
              <div style={{ marginTop: '2.5rem', display: 'flex', gap: '2rem' }}>
                <div>
                  <div style={{ opacity: 0.6, fontSize: '0.8rem', textTransform: 'uppercase' }}>Vigencia</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{cert.vigencia_meses} meses</div>
                </div>
              </div>
            </div>
          </StackedSection>
        ))}

        {/* Phase 2: Grid Section for All Certifications */}
        <StackedSection index={mainCerts.length} totalSections={total + 1}>
          <div className={`${styles.glassCard} ${styles.lightMode}`} style={{ height: 'auto', minHeight: '80vh', padding: '4rem' }}>
            <h2 style={{ fontSize: '3rem', marginBottom: '3rem', color: 'var(--color-primary-container)' }}>
              Explora el Catálogo Completo
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
              {typedCerts.map((cert) => (
                <div key={cert.id} style={{ 
                  background: 'white', 
                  padding: '2rem', 
                  borderRadius: '12px', 
                  border: '1px solid var(--glass-border)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                }}>
                  <span style={{ color: 'var(--color-secondary)', fontWeight: 700 }}>{cert.codigo}</span>
                  <h3 style={{ fontSize: '1.5rem', margin: '0.5rem 0 1rem' }}>{cert.nombre}</h3>
                  <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem', lineHeight: 1.5, height: '4.5rem', overflow: 'hidden' }}>
                    {cert.descripcion}
                  </p>
                  <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Detalles técnicos</span>
                    <button style={{ color: 'var(--color-primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                      Ver más →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </StackedSection>
      </main>
    </InteractiveSpotlightBackground>
  );
}
