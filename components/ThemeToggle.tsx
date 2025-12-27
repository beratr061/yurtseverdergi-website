'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    const currentIsDark = html.classList.contains('dark');
    
    // Geçiş animasyonu için class ekle
    html.classList.add('theme-transition');
    
    if (currentIsDark) {
      html.classList.remove('dark');
      html.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      html.classList.add('dark');
      html.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }

    // Animasyon bitince class'ı kaldır (performans için)
    setTimeout(() => {
      html.classList.remove('theme-transition');
    }, 300);
  };

  if (!mounted) {
    return (
      <button 
        className="relative p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 overflow-hidden" 
        aria-label="Tema değiştir"
      >
        <div className="h-5 w-5" />
      </button>
    );
  }

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors overflow-hidden"
      aria-label={isDark ? 'Aydınlık moda geç' : 'Karanlık moda geç'}
      title={isDark ? 'Aydınlık moda geç' : 'Karanlık moda geç'}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
    >
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.div
            key="sun"
            initial={{ rotate: -90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <Sun className="h-5 w-5 text-amber-400" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: 90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <Moon className="h-5 w-5 text-neutral-700" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
