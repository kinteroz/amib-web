'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QrImageProps {
  value: string;
  size?: number;
  style?: React.CSSProperties;
}

/**
 * Genera el QR localmente (sin servicios externos) como data URI.
 */
export function QrImage({ value, size = 200, style }: QrImageProps) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    QRCode.toDataURL(value, { width: size, margin: 1, errorCorrectionLevel: 'M' })
      .then((url) => { if (activo) setSrc(url); })
      .catch(() => { if (activo) setSrc(null); });
    return () => { activo = false; };
  }, [value, size]);

  if (!src) {
    return <div style={{ width: size, height: size, background: 'rgba(0,0,0,0.05)', borderRadius: '12px', ...style }} />;
  }

  return <img src={src} alt="Código QR de acceso" width={size} height={size} style={style} />;
}
