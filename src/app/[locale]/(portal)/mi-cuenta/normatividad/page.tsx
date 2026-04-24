'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '@/components/portal/portal.module.css';

interface Documento {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  fecha: string;
  folio: string;
  formato: 'PDF' | 'DOCX' | 'XLSX';
  iconType: 'bank' | 'law' | 'book' | 'tech';
}

const docsData: Documento[] = [
  {
    id: 'doc-001',
    titulo: 'Circular Única de Bancos - Actualización Título Cuarto',
    descripcion: 'Disposiciones de carácter general aplicables a las instituciones de crédito y su relación con el sector bursátil.',
    categoria: 'Circulares CNBV',
    fecha: '15 Oct 2023',
    folio: 'Ref: CUB-2023-04',
    formato: 'PDF',
    iconType: 'bank'
  },
  {
    id: 'doc-002',
    titulo: 'Norma de Autorregulación en Materia de Prevención de Conflictos de Interés',
    descripcion: 'Lineamientos éticos y operativos para la mitigación de riesgos de conflictos de interés en intermediarios.',
    categoria: 'Normas de Autorregulación',
    fecha: '02 Sep 2023',
    folio: 'V. 2.1',
    formato: 'DOCX',
    iconType: 'law'
  },
  {
    id: 'doc-003',
    titulo: 'Guía Operativa para el Reporte de Operaciones Inusuales',
    descripcion: 'Procedimientos estandarizados para la identificación y reporte de alertas tempranas en operaciones de mercado.',
    categoria: 'Guías Operativas',
    fecha: '20 Ago 2023',
    folio: 'Ref: GO-PLD-01',
    formato: 'PDF',
    iconType: 'tech'
  },
  {
    id: 'doc-004',
    titulo: 'Reglamento Interior del Comité de Certificación',
    descripcion: 'Estatutos que rigen el funcionamiento, facultades y obligaciones del órgano certificador bursátil.',
    categoria: 'Reglamento de Comités',
    fecha: '10 Jul 2023',
    folio: 'V. 4.0',
    formato: 'PDF',
    iconType: 'book'
  }
];

const categories = ['Todas', 'Circulares CNBV', 'Normas de Autorregulación', 'Reglamento de Comités', 'Guías Operativas'];

export default function NormatividadPage() {
  const [activeCat, setActiveCat] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFolio, setSearchFolio] = useState('');

  const filteredDocs = docsData.filter(doc => {
    const matchesCat = activeCat === 'Todas' || doc.categoria === activeCat;
    const matchesSearch = doc.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         doc.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFolio = doc.folio.toLowerCase().includes(searchFolio.toLowerCase());
    return matchesCat && matchesSearch && matchesFolio;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'bank': return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 21h18M3 10h18M5 10v11M19 10v11M10 21V10M14 21V10M12 3L2 10h20L12 3z" />
        </svg>
      );
      case 'law': return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="10" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
      case 'tech': return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      );
      default: return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );
    }
  };

  return (
    <div className={styles.normatividadWrapper}>
      <header className={styles.pageHeader}>
        <span className={styles.eyebrow}>Regulación AMIB</span>
        <h1 className={styles.pageTitle}>Normatividad y Regulación</h1>
        <p className={styles.pageDesc}>
          Acceso directo al repositorio institucional de normativas, circulares y documentos técnicos aplicables al sector bursátil.
        </p>
      </header>

      {/* SEARCH PANEL */}
      <div className={styles.searchPanelCard}>
        <h3 className={styles.panelTitle}>Búsqueda Avanzada</h3>
        <div className={styles.panelInputs}>
          <div className={styles.inputGroup}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input 
              type="text" 
              placeholder="Palabra clave, título o descripción..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className={styles.inputGroup}>
            <span style={{ fontSize: '1rem', opacity: 0.4 }}>#</span>
            <input 
              type="text" 
              placeholder="Número de Circular / Folio" 
              value={searchFolio}
              onChange={(e) => setSearchFolio(e.target.value)}
            />
          </div>
          <button className={styles.applyFiltersBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            Buscar Documentos
          </button>
        </div>

        <div className={styles.catFilterRow}>
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`${styles.catPill} ${activeCat === cat ? styles.catPillActive : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* DOCUMENTS LIST */}
      <div className={styles.docsListContainer}>
        <div className={styles.listHeader}>
          <span style={{ flex: 1 }}>Documento</span>
          <span style={{ width: '120px' }} className={styles.hideOnMobile}>Publicación</span>
          <span style={{ width: '100px' }} className={styles.hideOnMobile}>Formato</span>
          <span style={{ width: '80px', textAlign: 'right' }}>Acción</span>
        </div>

        <div className={styles.listRows}>
          <AnimatePresence mode="popLayout">
            {filteredDocs.map((doc) => (
              <motion.div 
                layout
                key={doc.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={styles.docRow}
              >
                <div className={styles.docMainInfo}>
                  <div className={styles.docIconCard}>
                    {getIcon(doc.iconType)}
                  </div>
                  <div className={styles.docText}>
                    <h4 className={styles.docRowTitle}>{doc.titulo}</h4>
                    <p className={styles.docRowDesc}>{doc.descripcion}</p>
                    <div className={styles.docMeta}>
                      <span className={styles.docTag}>{doc.categoria}</span>
                      <span className={styles.docRef}>{doc.folio}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.docRowDate + ' ' + styles.hideOnMobile}>
                  {doc.fecha}
                </div>

                <div className={styles.docRowFormat + ' ' + styles.hideOnMobile}>
                  <div className={`${styles.formatBadge} ${doc.formato === 'PDF' ? styles.pdf : styles.docx}`}>
                    {doc.formato}
                  </div>
                </div>

                <div className={styles.docRowAction}>
                  <button className={styles.rowDownloadBtn} title="Descargar Documento">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredDocs.length === 0 && (
            <div className={styles.emptyResults}>
              <p>No se encontraron documentos que coincidan con los criterios.</p>
              <button onClick={() => { setActiveCat('Todas'); setSearchTerm(''); setSearchFolio(''); }} className={styles.clearFilters}>Limpiar Filtros</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
