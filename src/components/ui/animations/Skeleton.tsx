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
        backgroundColor: 'rgba(0, 0, 0, 0.05)', 
        position: 'relative', 
        overflow: 'hidden',
        ...style
      }}
    >
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
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
    <div style={{ padding: '2rem', background: 'white', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '16px' }}>
      <Skeleton width="40%" height="12px" borderRadius="10px" style={{ opacity: 0.5 }} />
      <div style={{ marginTop: '1.2rem' }}>
        <Skeleton width="100%" height="24px" borderRadius="4px" />
        <Skeleton width="80%" height="24px" borderRadius="4px" style={{ marginTop: '8px' }} />
      </div>
      <div style={{ marginTop: '1.5rem' }}>
        <Skeleton width="100%" height="14px" borderRadius="4px" style={{ opacity: 0.6 }} />
        <Skeleton width="90%" height="14px" borderRadius="4px" style={{ marginTop: '6px', opacity: 0.6 }} />
      </div>
      <div style={{ marginTop: '1.5rem' }}>
        <Skeleton width="35%" height="12px" borderRadius="10px" style={{ opacity: 0.4 }} />
      </div>
    </div>
  );
}

export function NewsGridSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', width: '100%' }}>
      {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
    </div>
  );
}

export function BannerSkeleton() {
  return (
    <div style={{ 
      width: '100%', 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: '0 5%',
      backgroundColor: '#f8fafc' 
    }}>
      <Skeleton width="180px" height="14px" borderRadius="10px" style={{ marginBottom: '2.5rem', opacity: 0.3 }} />
      <Skeleton width="70%" height="80px" borderRadius="12px" style={{ marginBottom: '1.5rem' }} />
      <Skeleton width="50%" height="80px" borderRadius="12px" style={{ marginBottom: '4rem' }} />
      
      <div style={{ display: 'flex', gap: '6rem', marginTop: '2rem' }}>
        {[1, 2, 3].map(i => (
          <div key={i}>
            <Skeleton width="100px" height="40px" borderRadius="8px" />
            <Skeleton width="120px" height="12px" borderRadius="4px" style={{ marginTop: '1rem', opacity: 0.4 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CalendarSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem', width: '100%', minHeight: '500px' }}>
      <div style={{ background: 'rgba(0,0,0,0.02)', borderRadius: '32px', padding: '3rem', border: '1px solid rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem' }}>
          <div>
            <Skeleton width="150px" height="28px" />
            <Skeleton width="200px" height="12px" style={{ marginTop: '0.8rem', opacity: 0.5 }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1rem' }}>
           {Array.from({ length: 35 }).map((_, i) => (
             <Skeleton key={i} width="100%" height="45px" borderRadius="12px" style={{ opacity: 0.3 }} />
           ))}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Skeleton width="150px" height="24px" />
        {[1, 2, 3].map(i => (
          <div key={i} style={{ padding: '1.5rem', background: 'white', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Skeleton width="50px" height="50px" borderRadius="12px" />
              <div style={{ flex: 1 }}>
                <Skeleton width="80%" height="16px" />
                <Skeleton width="60%" height="12px" style={{ marginTop: '0.8rem', opacity: 0.5 }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
