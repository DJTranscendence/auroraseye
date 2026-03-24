'use client';

import { useEffect, useState } from 'react';
import styles from './CustomCursor.module.css';
import { MousePointer2 } from 'lucide-react';


export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isStandard, setIsStandard] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('cursorType');
    if (saved === 'standard') {
      setIsStandard(true);
      document.documentElement.classList.add('use-standard-cursor');
    }
  }, []);

  const toggleCursor = () => {
    const newVal = !isStandard;
    setIsStandard(newVal);
    if (newVal) {
      document.documentElement.classList.add('use-standard-cursor');
      localStorage.setItem('cursorType', 'standard');
    } else {
      document.documentElement.classList.remove('use-standard-cursor');
      localStorage.setItem('cursorType', 'lens');
    }
  };

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleHoverStart = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, [data-hover-glow]')) {
        setIsHovering(true);
      }
    };

    const handleHoverEnd = () => {
      setIsHovering(false);
    };

    window.addEventListener('mousemove', updatePosition);
    window.addEventListener('mouseover', handleHoverStart);
    window.addEventListener('mouseout', handleHoverEnd);

    return () => {
      window.removeEventListener('mousemove', updatePosition);
      window.removeEventListener('mouseover', handleHoverStart);
      window.removeEventListener('mouseout', handleHoverEnd);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {!isStandard && (
        <div 
          className={`${styles.cursor} ${isHovering ? styles.hovering : ''}`}
          style={{ left: `${position.x}px`, top: `${position.y}px` }}
        >
          <div className={styles.lens}></div>
        </div>
      )}
      
      <button 
        onClick={toggleCursor}
        className={styles.toggleBtn}
        title="Switch Cursor Style"
      >
        <MousePointer2 size={14} />
      </button>

    </>
  );
}



