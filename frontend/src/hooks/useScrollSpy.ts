import { useState, useEffect } from 'react';

export function useScrollSpy(sectionIds: string[], offset = 80): string {
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + offset + 10;

      let current = '';
      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (element) {
          const { offsetTop } = element;
          if (scrollPosition >= offsetTop) {
            current = id;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [sectionIds, offset]);

  return activeSection;
}
