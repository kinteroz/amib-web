'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import styles from './animations.module.css';

interface StackedSectionProps {
  children: React.ReactNode;
  index: number;
  totalSections: number;
}

export function StackedSection({ children, index, totalSections }: StackedSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // We track the scroll progress of THIS specific section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'], // when top meets top, until bottom meets top
  });

  // As the user scrolls past this section, it scales down slightly and drops opacity
  // If it's the last section, we might not want to scale it down, but let's do it for consistency.
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.4]);
  
  // To create the 'stacked cards' overlapping feel, the top of the content must be sticky
  
  return (
    <div ref={containerRef} className={styles.stackedSectionWrapper} style={{ position: 'relative', zIndex: totalSections - index }}>
      <motion.div 
        className={styles.stackedSectionContent}
        style={{ scale, opacity }}
      >
        {children}
      </motion.div>
    </div>
  );
}
