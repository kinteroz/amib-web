'use client';

import React, { useEffect, useRef } from 'react';
import jsQR from 'jsqr';

interface QrScannerProps {
  onScan: (code: string) => void;
  height?: number;
}

/**
 * Lector de QR con la cámara del dispositivo.
 * Usa BarcodeDetector nativo cuando existe (Chrome/Android) y cae a jsQR
 * sobre canvas en el resto (Safari/iOS). Ignora lecturas repetidas por 3s.
 */
export function QrScanner({ onScan, height = 260 }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  useEffect(() => {
    let stream: MediaStream | null = null;
    let rafId = 0;
    let detenido = false;
    let ultimoCodigo = '';
    let ultimoTs = 0;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const Detector = (window as any).BarcodeDetector;
    const detector = Detector ? new Detector({ formats: ['qr_code'] }) : null;

    const emitir = (codigo: string) => {
      const ahora = Date.now();
      if (codigo === ultimoCodigo && ahora - ultimoTs < 3000) return;
      ultimoCodigo = codigo;
      ultimoTs = ahora;
      onScanRef.current(codigo);
    };

    const tick = async () => {
      if (detenido) return;
      const video = videoRef.current;
      if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
        try {
          if (detector) {
            const codes = await detector.detect(video);
            if (codes.length > 0 && codes[0].rawValue) emitir(codes[0].rawValue);
          } else if (ctx) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);
            const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const result = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' });
            if (result?.data) emitir(result.data);
          }
        } catch {
          // frame ilegible; seguir intentando
        }
      }
      rafId = requestAnimationFrame(tick);
    };

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((s) => {
        if (detenido) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play().catch(() => {});
        }
        rafId = requestAnimationFrame(tick);
      })
      .catch(() => {
        // sin permiso de cámara; el input manual sigue disponible
      });

    return () => {
      detenido = true;
      cancelAnimationFrame(rafId);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <video
      ref={videoRef}
      muted
      playsInline
      style={{ width: '100%', height, objectFit: 'cover', background: 'black', borderRadius: '8px' }}
    />
  );
}
