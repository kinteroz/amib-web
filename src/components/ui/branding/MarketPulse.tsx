'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import styles from '../animations/animations.module.css';

export function MarketPulse() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  // Parallax: The background moves slower than the foreground
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0.4, 0]);

  return (
    <motion.div 
      ref={ref} 
      className={styles.marketContainer}
      style={{ y, opacity, position: 'relative' }}
    >
      <svg width="100%" height="100%" viewBox="0 0 1440 800" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.path
          d="M-50 600C100 550 250 650 400 600C550 550 700 450 850 500C1000 550 1150 400 1300 450C1450 500 1550 400 1650 450"
          stroke="var(--color-secondary-container)"
          strokeWidth="1"
          strokeOpacity="0.3"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            duration: 4,
            ease: "easeInOut",
          }}
        />
        <motion.path
          d="M-50 650C150 600 300 750 500 650C700 550 850 600 1000 650C1150 700 1300 550 1500 600"
          stroke="var(--color-secondary-container)"
          strokeWidth="0.5"
          strokeOpacity="0.2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            duration: 6,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </svg>
    </motion.div>
  );
}
