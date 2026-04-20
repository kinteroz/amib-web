'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ width = '100%', height = '20px', borderRadius = '4px', className = '', style = {} }: SkeletonProps) {
  return (
    <div 
      className={className}
      style={{ 
        width, 
        height, 
        borderRadius, 
        backgroundColor: 'rgba(255, 255, 255, 0.05)', 
        position: 'relative', 
        overflow: 'hidden',
        ...style
      }}
    >
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.08) 50%, transparent 100%)',
          zIndex: 1,
        }}
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div style={{ padding: '2rem', background: 'var(--surface-container-highest)', borderRadius: '8px' }}>
      <Skeleton width="40%" height="14px" borderRadius="2px" />
      <div style={{ marginTop: '1rem' }}>
        <Skeleton width="100%" height="24px" />
        <Skeleton width="80%" height="24px" style={{ marginTop: '8px' }} />
      </div>
      <div style={{ marginTop: '1.5rem' }}>
        <Skeleton width="100%" height="16px" />
        <Skeleton width="90%" height="16px" style={{ marginTop: '8px' }} />
      </div>
      <div style={{ marginTop: '1.5rem' }}>
        <Skeleton width="30%" height="14px" />
      </div>
    </div>
  );
}
