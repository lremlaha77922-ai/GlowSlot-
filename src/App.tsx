import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './lib/i18n';
import { changeLanguage } from './lib/i18n';

export default function App() {
  const { t, i18n } = useTranslation();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [isDark]);

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'hi' : 'en';
    changeLanguage(nextLang);
  };

  return (
    <div className="min-h-screen bg-bg text-text p-6 flex flex-col items-center justify-center font-sans transition-colors duration-200">
      <div className="w-full max-w-md bg-surface p-6 rounded-card border border-border shadow-level-1 flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h1 className="text-xl font-bold text-primary tracking-tight">GlowSlot</h1>
            <p className="text-xs text-muted">Phase 0: Foundation</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDark(!isDark)}
              className="px-3 py-1.5 text-xs font-semibold rounded-button border border-border bg-surface text-text hover:bg-primary-soft transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDark ? '🌙 Dark' : '☀️ Light'}
            </button>
            <button
              onClick={toggleLanguage}
              className="px-3 py-1.5 text-xs font-semibold rounded-button border border-primary bg-primary-soft text-primary hover:opacity-90 transition-opacity cursor-pointer"
              aria-label="Toggle language"
            >
              {i18n.language === 'en' ? 'हिन्दी' : 'English'}
            </button>
          </div>
        </div>

        <div className="p-4 rounded-button bg-primary-soft border border-primary/20">
          <p className="text-xs font-medium text-primary uppercase tracking-wider mb-1">
            i18n Sample Test Key
          </p>
          <p className="text-base font-semibold text-text">
            {t('test_key')}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-button border border-border bg-surface">
            <div className="w-3 h-3 rounded-full bg-primary mb-1.5" />
            <span className="font-medium text-text">Primary Token</span>
            <p className="text-muted text-[10px]">#4F46E5 / #818CF8</p>
          </div>
          <div className="p-3 rounded-button border border-border bg-surface">
            <div className="w-3 h-3 rounded-full bg-accent mb-1.5" />
            <span className="font-medium text-text">Accent Token</span>
            <p className="text-muted text-[10px]">#FF6B57 / #FF8A78</p>
          </div>
          <div className="p-3 rounded-button border border-border bg-surface">
            <div className="w-3 h-3 rounded-full bg-deal mb-1.5" />
            <span className="font-medium text-text">Deal Token</span>
            <p className="text-muted text-[10px]">#F59E0B / #FBBF24</p>
          </div>
          <div className="p-3 rounded-button border border-border bg-surface">
            <div className="w-3 h-3 rounded-full bg-success mb-1.5" />
            <span className="font-medium text-text">Success Token</span>
            <p className="text-muted text-[10px]">#0D9488 / #2DD4BF</p>
          </div>
        </div>

        <div className="text-center pt-2">
          <span className="inline-block px-3 py-1 text-[11px] font-medium text-muted bg-bg rounded-chip border border-border">
            Execution Lock Active • Awaiting Phase 1
          </span>
        </div>
      </div>
    </div>
  );
}
