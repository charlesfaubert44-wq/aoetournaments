'use client';

import { useState } from 'react';

export default function LanguageToggle() {
  const [locale, setLocale] = useState<'en' | 'fr'>('fr');

  const toggleLanguage = () => {
    const newLocale = locale === 'en' ? 'fr' : 'en';
    setLocale(newLocale);
    localStorage.setItem('locale', newLocale);
    // In a full implementation, this would trigger a re-render with new translations
  };

  return (
    <button
      onClick={toggleLanguage}
      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
    >
      {locale === 'en' ? 'FR' : 'EN'}
    </button>
  );
}
