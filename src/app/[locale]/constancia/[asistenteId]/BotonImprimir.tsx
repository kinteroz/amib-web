'use client';

import React from 'react';

export function BotonImprimir() {
  return (
    <button
      onClick={() => window.print()}
      style={{ padding: '0.8rem 2rem', borderRadius: '10px', border: 'none', background: '#002048', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
    >
      🖨 Imprimir / Guardar PDF
    </button>
  );
}
