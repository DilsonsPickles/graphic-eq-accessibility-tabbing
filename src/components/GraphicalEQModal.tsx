'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './GraphicalEQModal.module.css';
import TabGroup from './TabGroup';
import NestedTabGroup from './NestedTabGroup';

interface GraphicalEQModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GraphicalEQModal({ isOpen, onClose }: GraphicalEQModalProps) {
  const [faderValues, setFaderValues] = useState<number[]>(new Array(32).fill(0));
  const [selectedPreset, setSelectedPreset] = useState('Default');
  const presetDropdownRef = useRef<HTMLSelectElement>(null);

  const frequencies = [
    '20', '25', '31', '40', '50', '63', '80', '100', '125', '160', 
    '200', '250', '315', '400', '500', '630', '800', '1K', '1.25K', '1.6K',
    '2K', '2.5K', '3.15K', '4K', '5K', '6.3K', '8K', '10K', '12.5K', '16K', '20K', '25K'
  ];

  const decibelScale = [20, 18, 12, 6, 0, -6, -12, -18, -20];

  const handleFaderChange = (index: number, value: number) => {
    const newValues = [...faderValues];
    newValues[index] = value;
    setFaderValues(newValues);
  };

  const handleFlatten = () => {
    setFaderValues(new Array(32).fill(0));
  };

  const handleInvert = () => {
    setFaderValues(faderValues.map(value => -value));
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Check if we're in a nested tab group
        const activeElement = document.activeElement;
        const nestedActiveElement = document.querySelector('.nested-active');
        
        // Only close modal if we're not inside a nested group
        if (!nestedActiveElement || !nestedActiveElement.contains(activeElement)) {
          onClose();
        }
      } else if (event.key === 'F6') {
        event.preventDefault();
        const activeElement = document.activeElement;
        
        if (event.shiftKey) {
          // Shift+F6 navigation (backwards): Preview → Invert → Slider container → Preset dropdown → (loop back)
          if (activeElement?.getAttribute('tabindex') === '4') {
            // From Preview to Invert button
            const eqControlsGroup = document.querySelector('[tabindex="3"]') as HTMLElement;
            if (eqControlsGroup) {
              const invertButton = Array.from(eqControlsGroup.querySelectorAll('button')).find(btn => 
                btn.textContent?.includes('Invert')
              ) as HTMLElement;
              if (invertButton) {
                eqControlsGroup.focus();
                setTimeout(() => {
                  invertButton.focus();
                }, 50);
              } else {
                eqControlsGroup.focus();
              }
            }
          } else if (activeElement?.textContent?.includes('Invert') || 
                     (activeElement?.getAttribute('tabindex') === '3')) {
            // From Invert or EQ controls group to slider container
            const sliderContainer = document.querySelector('[tabindex="2"]') as HTMLElement;
            sliderContainer?.focus();
          } else if (activeElement?.getAttribute('tabindex') === '2') {
            // From slider container to preset dropdown
            presetDropdownRef.current?.focus();
          } else if (activeElement === presetDropdownRef.current) {
            // From preset dropdown to Preview (wrapping backwards)
            const previewButton = document.querySelector('[tabindex="4"]') as HTMLElement;
            previewButton?.focus();
          } else {
            // Default: go to Preview
            const previewButton = document.querySelector('[tabindex="4"]') as HTMLElement;
            previewButton?.focus();
          }
        } else {
          // F6 navigation (forwards): Preset dropdown → Slider container → Invert → Preview → (loop back)
          if (activeElement === presetDropdownRef.current) {
            // From preset dropdown to slider container
            const sliderContainer = document.querySelector('[tabindex="2"]') as HTMLElement;
            sliderContainer?.focus();
          } else if (activeElement?.getAttribute('tabindex') === '2') {
            // From slider container to Invert button (tabindex 3 is the EQ controls group, find Invert within it)
            const eqControlsGroup = document.querySelector('[tabindex="3"]') as HTMLElement;
            if (eqControlsGroup) {
              const invertButton = Array.from(eqControlsGroup.querySelectorAll('button')).find(btn => 
                btn.textContent?.includes('Invert')
              ) as HTMLElement;
              if (invertButton) {
                // First focus the group, then use arrow keys to get to Invert
                eqControlsGroup.focus();
                setTimeout(() => {
                  invertButton.focus();
                }, 50);
              } else {
                eqControlsGroup.focus();
              }
            }
          } else if (activeElement?.textContent?.includes('Invert') || 
                     (activeElement?.getAttribute('tabindex') === '3')) {
            // From Invert or EQ controls group to Preview
            const previewButton = document.querySelector('[tabindex="4"]') as HTMLElement;
            previewButton?.focus();
          } else if (activeElement?.getAttribute('tabindex') === '4') {
            // From Preview back to preset dropdown
            presetDropdownRef.current?.focus();
          } else {
            // Default: go to preset dropdown
            presetDropdownRef.current?.focus();
          }
        }
      } else if (event.key === 'Tab') {
        const activeElement = document.activeElement;
        
        // If we're on the Apply button and tabbing forward, wrap to preset dropdown
        if (activeElement?.getAttribute('tabindex') === '6' && !event.shiftKey) {
          event.preventDefault();
          presetDropdownRef.current?.focus();
        }
        // If we're on the preset dropdown and shift-tabbing backward, wrap to Apply button
        else if (activeElement === presetDropdownRef.current && event.shiftKey) {
          event.preventDefault();
          const applyButton = document.querySelector('[tabindex="6"]') as HTMLElement;
          applyButton?.focus();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Set initial focus to the preset dropdown
      setTimeout(() => {
        presetDropdownRef.current?.focus();
      }, 100);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <h1 className={styles.title}>Graphic EQ</h1>
          <div className={styles.windowControls}>
            <button 
              className={styles.controlButton}
              tabIndex={-1}
              aria-label="Minimize"
            >
              −
            </button>
            <button 
              className={styles.controlButton}
              tabIndex={-1}
              aria-label="Maximize"
            >
              □
            </button>
            <button 
              className={styles.controlButton}
              tabIndex={-1}
              aria-label="Close"
              onClick={onClose}
            >
              ×
            </button>
          </div>
        </div>

        {/* Preset Header */}
        <TabGroup className={styles.presetHeader} tabIndex={1}>
          <select 
            ref={presetDropdownRef}
            className={styles.presetDropdown}
            value={selectedPreset}
            onChange={(e) => setSelectedPreset(e.target.value)}
            onKeyDown={(e) => {
              // Prevent default arrow key behavior on dropdown to allow TabGroup navigation
              if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
                return;
              }
              // For Enter and Space, manually trigger dropdown opening
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const select = e.target as HTMLSelectElement;
                // Focus and simulate clicking to open
                select.focus();
                select.showPicker?.(); // Modern browser method
                // Fallback for older browsers
                if (!select.showPicker) {
                  const event = new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                  });
                  select.dispatchEvent(event);
                }
                return;
              }
            }}
          >
            <option>Default</option>
            <option>Rock</option>
            <option>Pop</option>
            <option>Jazz</option>
            <option>Classical</option>
          </select>
          <button className={styles.iconButton} aria-label="Save preset">
            💾
          </button>
          <button className={styles.iconButton} aria-label="Reset preset">
            🔄
          </button>
          <button className={styles.iconButton} aria-label="More options">
            ⋮
          </button>
        </TabGroup>

        {/* EQ Container */}
        <div className={styles.eqContainer}>
          {/* Frequency Labels */}
          <div className={styles.frequencyLabels}>
            {frequencies.map((freq, index) => (
              <div key={index} className={styles.frequencyLabel}>
                {freq}
              </div>
            ))}
          </div>

          {/* EQ Grid */}
          <div className={styles.eqGrid}>
            {/* Decibel Scale */}
            <div className={styles.decibelScale}>
              {decibelScale.map((db, index) => (
                <div key={index} className={styles.decibelLabel}>
                  {db > 0 ? `+${db}` : db}
                </div>
              ))}
            </div>

            {/* Grid Lines */}
            <div className={styles.gridLines}>
              {decibelScale.map((_, index) => (
                <div key={index} className={styles.gridLine} />
              ))}
            </div>

            {/* Faders */}
            <NestedTabGroup 
              className={styles.fadersContainer} 
              tabIndex={2}
              ariaLabel="EQ Fader controls - press Enter to navigate individual faders, Escape to exit"
            >
              {frequencies.map((freq, index) => (
                <input
                  key={index}
                  type="range"
                  min="-20"
                  max="20"
                  value={faderValues[index]}
                  onChange={(e) => handleFaderChange(index, parseInt(e.target.value))}
                  className={styles.fader}
                  aria-label={`${freq} Hz frequency band`}
                />
              ))}
            </NestedTabGroup>
          </div>

          {/* EQ Controls */}
          <TabGroup className={styles.eqControls} tabIndex={3}>
            <button 
              className={styles.eqButton}
              onClick={handleFlatten}
            >
              Flatten
            </button>
            <button 
              className={styles.eqButton}
              onClick={handleInvert}
            >
              Invert
            </button>
          </TabGroup>
        </div>

        {/* Modal Footer */}
        <div className={styles.modalFooter}>
          <button className={styles.previewButton} tabIndex={4}>
            Preview
          </button>
          <div className={styles.buttonGroup}>
            <button className={styles.cancelButton} tabIndex={5} onClick={onClose}>
              Cancel
            </button>
            <button className={styles.applyButton} tabIndex={6}>
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}