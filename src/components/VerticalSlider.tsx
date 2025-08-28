'use client';

import { useRef, useState, useCallback } from 'react';
import styles from './VerticalSlider.module.css';

interface VerticalSliderProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  ariaLabel: string;
  tabIndex?: number;
}

export default function VerticalSlider({ 
  value, 
  min, 
  max, 
  onChange, 
  ariaLabel, 
  tabIndex = 0 
}: VerticalSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const normalizeValue = (val: number) => Math.max(min, Math.min(max, val));
  
  const getPercentage = () => ((value - min) / (max - min)) * 100;

  const updateValueFromPosition = useCallback((clientY: number) => {
    if (!sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(100, ((rect.bottom - clientY) / rect.height) * 100));
    const newValue = Math.round(min + (percentage / 100) * (max - min));
    onChange(normalizeValue(newValue));
  }, [min, max, onChange]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updateValueFromPosition(e.clientY);
    
    const handleMouseMove = (e: MouseEvent) => {
      updateValueFromPosition(e.clientY);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [updateValueFromPosition]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updateValueFromPosition(e.touches[0].clientY);
    
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      updateValueFromPosition(e.touches[0].clientY);
    };
    
    const handleTouchEnd = () => {
      setIsDragging(false);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  }, [updateValueFromPosition]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    let newValue = value;
    const step = 1;
    
    // Clear existing timeout
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    
    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        e.preventDefault();
        setShowTooltip(true);
        newValue = value + step;
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
        e.preventDefault();
        setShowTooltip(true);
        newValue = value - step;
        break;
      case 'PageUp':
        e.preventDefault();
        setShowTooltip(true);
        newValue = value + step * 5;
        break;
      case 'PageDown':
        e.preventDefault();
        setShowTooltip(true);
        newValue = value - step * 5;
        break;
      case 'Home':
        e.preventDefault();
        setShowTooltip(true);
        newValue = max;
        break;
      case 'End':
        e.preventDefault();
        setShowTooltip(true);
        newValue = min;
        break;
      default:
        return;
    }
    
    onChange(normalizeValue(newValue));
    
    // Hide tooltip after 1.5 seconds of inactivity
    tooltipTimeoutRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, 1500);
  }, [value, min, max, onChange]);

  const handleFocus = useCallback(() => {
    // Don't show tooltip on focus, only on keyboard interaction
  }, []);

  const handleBlur = useCallback(() => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    setShowTooltip(false);
  }, []);

  const thumbPosition = `${100 - getPercentage()}%`;

  return (
    <div
      ref={sliderRef}
      className={`${styles.slider} ${isDragging ? styles.dragging : ''}`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onFocus={handleFocus}
      onBlur={handleBlur}
      role="slider"
      aria-label={ariaLabel}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      tabIndex={tabIndex}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.track}>
        <div 
          className={styles.fill}
          style={{ height: `${100 - getPercentage()}%` }}
        />
      </div>
      <div
        ref={thumbRef}
        className={styles.thumb}
        style={{ top: thumbPosition }}
      />
      {showTooltip && (
        <div 
          className={styles.tooltip}
          style={{ 
            top: `calc(${thumbPosition} - 40px)`,
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          {value > 0 ? `+${value}` : value} dB
        </div>
      )}
    </div>
  );
}