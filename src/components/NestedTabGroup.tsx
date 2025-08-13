'use client';

import { useRef, useEffect, useCallback, ReactElement, cloneElement, useState } from 'react';

interface NestedTabGroupProps {
  children: ReactElement[];
  className?: string;
  tabIndex?: number;
  ariaLabel?: string;
}

export default function NestedTabGroup({ children, className, tabIndex = 0, ariaLabel }: NestedTabGroupProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isNested, setIsNested] = useState(false);
  const currentFocusIndex = useRef<number>(0);
  const focusableElements = useRef<HTMLElement[]>([]);

  const updateFocusableElements = useCallback(() => {
    if (!containerRef.current) return;
    
    const elements = Array.from(
      containerRef.current.querySelectorAll(
        'button, input, select, textarea, [role="slider"], [tabindex]:not([tabindex="-1"])'
      )
    ) as HTMLElement[];
    
    focusableElements.current = elements;
  }, []);

  const focusElement = useCallback((index: number) => {
    const elements = focusableElements.current;
    if (elements.length === 0) return;
    
    const targetIndex = ((index % elements.length) + elements.length) % elements.length;
    currentFocusIndex.current = targetIndex;
    elements[targetIndex]?.focus();
  }, []);

  const enterNestedMode = useCallback(() => {
    setIsNested(true);
    containerRef.current?.classList.add('nested-active');
    currentFocusIndex.current = 0;
    focusElement(0);
  }, [focusElement]);

  const exitNestedMode = useCallback(() => {
    setIsNested(false);
    containerRef.current?.classList.remove('nested-active');
    containerRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!containerRef.current) return;

    // If we're not in nested mode and this container is focused
    if (!isNested && document.activeElement === containerRef.current) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        enterNestedMode();
        return;
      }
    }

    // If we're in nested mode and focus is within this container
    if (isNested && containerRef.current.contains(event.target as Node)) {
      const elements = focusableElements.current;
      if (elements.length === 0) return;

      const currentElement = event.target as HTMLElement;
      const currentIndex = elements.indexOf(currentElement);
      
      if (currentIndex === -1) return;

      switch (event.key) {
        case 'Tab':
          event.preventDefault();
          if (event.shiftKey) {
            focusElement(currentIndex - 1);
          } else {
            focusElement(currentIndex + 1);
          }
          break;
        case 'Escape':
          event.preventDefault();
          event.stopPropagation();
          exitNestedMode();
          break;
      }
    }
  }, [isNested, enterNestedMode, exitNestedMode, focusElement]);

  const handleFocus = useCallback((event: FocusEvent) => {
    if (!containerRef.current?.contains(event.target as Node)) return;
    
    // If focus comes to the container itself, don't enter nested mode automatically
    if (event.target === containerRef.current) {
      setIsNested(false);
      return;
    }

    // If we're already in nested mode, track the focus
    if (isNested) {
      const elements = focusableElements.current;
      const currentElement = event.target as HTMLElement;
      const currentIndex = elements.indexOf(currentElement);
      
      if (currentIndex !== -1) {
        currentFocusIndex.current = currentIndex;
      }
    }
  }, [isNested]);

  const handleBlur = useCallback((event: FocusEvent) => {
    // If focus is leaving the container entirely, exit nested mode
    if (!containerRef.current?.contains(event.relatedTarget as Node)) {
      setIsNested(false);
      containerRef.current?.classList.remove('nested-active');
    }
  }, []);

  useEffect(() => {
    updateFocusableElements();
    
    const container = containerRef.current;
    if (!container) return;

    document.addEventListener('keydown', handleKeyDown);
    container.addEventListener('focusin', handleFocus);
    container.addEventListener('focusout', handleBlur);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('focusin', handleFocus);
      container.removeEventListener('focusout', handleBlur);
    };
  }, [handleKeyDown, handleFocus, handleBlur]);

  useEffect(() => {
    updateFocusableElements();
  }, [children, updateFocusableElements]);

  const enhancedChildren = children.map((child, index) => {
    return cloneElement(child, {
      ...(child.props || {}),
      tabIndex: isNested ? (index === 0 ? 0 : -1) : (index === 0 ? -1 : -1),
      key: index
    } as React.HTMLProps<HTMLElement>);
  });

  return (
    <div 
      ref={containerRef} 
      className={`${className} ${isNested ? 'nested-active' : ''}`}
      tabIndex={tabIndex}
      role="group"
      aria-label={ariaLabel || "Nested tab group - press Enter to activate, Escape to exit"}
    >
      {enhancedChildren}
    </div>
  );
}