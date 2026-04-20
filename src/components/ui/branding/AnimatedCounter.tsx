'use client';

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate, useMotionValueEvent } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
}

export function AnimatedCounter({ value, suffix = '' }: AnimatedCounterProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);

  // Sync motion value with local state for rendering
  useMotionValueEvent(rounded, "change", (latest) => {
    setDisplayValue(latest);
  });

  useEffect(() => {
    // Only animate once on load
    const controls = animate(count, value, {
      duration: 2,
      ease: 'easeOut',
      delay: 0.5,
    });

    return () => controls.stop();
  }, [count, value]);

  return (
    <span>
      {displayValue}
      {suffix}
    </span>
  );
}
