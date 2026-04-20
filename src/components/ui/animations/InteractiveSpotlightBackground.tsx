'use client';

import React, { useEffect, useState } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import styles from './animations.module.css';

interface InteractiveSpotlightBackgroundProps {
  children: React.ReactNode;
}

export function InteractiveSpotlightBackground({
  children,
}: InteractiveSpotlightBackgroundProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update mouse position on mouse move over the container
  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  // Create a template for the radial gradient
  const background = useMotionTemplate`radial-gradient(1000px circle at ${mouseX}px ${mouseY}px, rgba(234, 171, 0, 0.08), transparent 80%)`;

  return (
    <div
      className={styles.spotlightWrapper}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className={styles.spotlightOverlay}
        style={{
          background: isClient ? background : undefined, // prevent hydration mismatch
        }}
      />
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
        {children}
      </div>
    </div>
  );
}
