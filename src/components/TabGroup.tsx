'use client';

import { useRef, useEffect, useCallback, ReactElement, cloneElement } from 'react';

interface TabGroupProps {
  children: ReactElement[];
  className?: string;
  tabIndex?: number;
}

export default function TabGroup({ children, className, tabIndex = 0 }: TabGroupProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentFocusIndex = useRef<number>(0);

  const focusableElements = useRef<HTMLElement[]>([]);

  const updateFocusableElements = useCallback(() => {
    if (!containerRef.current) return;
    
    const elements = Array.from(
      containerRef.current.querySelectorAll(
        'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
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

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!containerRef.current?.contains(event.target as Node)) return;
    
    const elements = focusableElements.current;
    if (elements.length === 0) return;

    const currentElement = event.target as HTMLElement;
    const currentIndex = elements.indexOf(currentElement);
    
    if (currentIndex === -1) return;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        focusElement(currentIndex + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        focusElement(currentIndex - 1);
        break;
    }
  }, [focusElement]);

  const handleFocus = useCallback((event: FocusEvent) => {
    if (!containerRef.current?.contains(event.target as Node)) return;
    
    const elements = focusableElements.current;
    const currentElement = event.target as HTMLElement;
    const currentIndex = elements.indexOf(currentElement);
    
    if (currentIndex !== -1) {
      currentFocusIndex.current = currentIndex;
    }
  }, []);

  useEffect(() => {
    updateFocusableElements();
    
    const container = containerRef.current;
    if (!container) return;

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocus);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleFocus);
    };
  }, [handleKeyDown, handleFocus, updateFocusableElements]);

  useEffect(() => {
    updateFocusableElements();
  }, [children, updateFocusableElements]);

  const enhancedChildren = children.map((child, index) => {
    if (index === 0) {
      return cloneElement(child, {
        ...(child.props || {}),
        tabIndex: tabIndex,
        key: index
      } as React.HTMLProps<HTMLElement>);
    } else {
      return cloneElement(child, {
        ...(child.props || {}),
        tabIndex: -1,
        key: index
      } as React.HTMLProps<HTMLElement>);
    }
  });

  return (
    <div 
      ref={containerRef} 
      className={className}
      role="group"
      aria-label="Tab group - use arrow keys to navigate"
    >
      {enhancedChildren}
    </div>
  );
}