'use client';

import { useState } from 'react';
import styles from "./page.module.css";
import GraphicalEQModal from '../components/GraphicalEQModal';
import AlternativeModal from '../components/AlternativeModal';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAltModalOpen, setIsAltModalOpen] = useState(false);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 style={{ marginBottom: '2rem', color: '#333' }}>
          Audacity Graphical EQ Tabbing Prototype
        </h1>
        
        <p style={{ marginBottom: '2rem', textAlign: 'center', maxWidth: '600px' }}>
          This prototype demonstrates custom tab order management for accessibility 
          in a graphical equalizer modal interface.
        </p>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setIsModalOpen(true)}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Open Graphical EQ
          </button>
          
          <button 
            onClick={() => setIsAltModalOpen(true)}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#cc6600',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Open Alternative Modal
          </button>
        </div>

        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8f8f8', borderRadius: '6px', maxWidth: '600px' }}>
          <h3>Testing Instructions:</h3>
          <ul style={{ textAlign: 'left', marginTop: '1rem' }}>
            <li>Click &quot;Open Graphical EQ&quot; to launch the modal</li>
            <li><strong>Main Tab Order (Circular):</strong></li>
            <li style={{ marginLeft: '20px' }}>Preset group → Each EQ fader individually → EQ button group → Footer button group → (wraps back to Preset group)</li>
            <li><strong>EQ Faders:</strong></li>
            <li style={{ marginLeft: '20px' }}>• Tab navigates through each individual fader</li>
            <li style={{ marginLeft: '20px' }}>• Use arrow keys on each fader to adjust frequency values</li>
            <li style={{ marginLeft: '20px' }}>• Arrow keys show a tooltip with the current dB value</li>
            <li><strong>Regular Tab Groups:</strong></li>
            <li style={{ marginLeft: '20px' }}>• Preset group (Dropdown, Save, Reset, Options) - arrow key navigation, Enter to open dropdown</li>
            <li style={{ marginLeft: '20px' }}>• EQ controls (Flatten, Invert) - arrow key navigation</li>
            <li style={{ marginLeft: '20px' }}>• Footer buttons (Preview, Cancel, Apply) - arrow key navigation</li>
            <li><strong>F6 Key:</strong> Jump between major sections (Preset → Sliders → Invert → Preview → loop back)</li>
            <li><strong>Shift+F6:</strong> Jump backwards through sections (Preview → Invert → Sliders → Preset → loop back)</li>
            <li>Press Escape or click Close to exit the modal</li>
          </ul>
        </div>
      </main>

      <GraphicalEQModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      <AlternativeModal 
        isOpen={isAltModalOpen} 
        onClose={() => setIsAltModalOpen(false)} 
      />
    </div>
  );
}
