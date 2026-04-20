import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = ({ variant = 'default' }) => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const toggle = () => {
    i18n.changeLanguage(isArabic ? 'en' : 'ar');
  };

  if (variant === 'minimal') {
    return (
      <button
        onClick={toggle}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
        title={isArabic ? 'Switch to English' : 'التبديل إلى العربية'}
      >
        <Globe className="w-3.5 h-3.5" />
        {isArabic ? 'EN' : 'عر'}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-semibold transition-all hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 shadow-sm"
      title={isArabic ? 'Switch to English' : 'التبديل إلى العربية'}
    >
      <Globe className="w-4 h-4 text-slate-400" />
      {isArabic ? 'English' : 'العربية'}
    </button>
  );
};

export default LanguageSwitcher;
