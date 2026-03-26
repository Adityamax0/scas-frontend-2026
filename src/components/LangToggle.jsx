'use client';

import { useLang } from '@/lib/LanguageContext';

/**
 * Floating Language Toggle Button — visible on every page.
 * Switches between हिन्दी and English with a single tap.
 */
export default function LangToggle() {
  const { lang, toggleLang, t } = useLang();

  return (
    <button
      onClick={toggleLang}
      title="Switch Language / भाषा बदलें"
      style={{
        position: 'fixed',
        bottom: '90px',       // Above the Krishi Mitra chat button
        right: '24px',
        zIndex: 10000,
        padding: '10px 18px',
        borderRadius: '999px',
        border: 'none',
        background: lang === 'hi'
          ? 'linear-gradient(135deg, #FF6B35, #F7C59F)' // Saffron for Hindi
          : 'linear-gradient(135deg, #1b4332, #40916c)', // Green for English
        color: '#fff',
        fontWeight: '800',
        fontSize: '13px',
        letterSpacing: '0.5px',
        cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      🌐 {t('toggleLang')}
    </button>
  );
}
