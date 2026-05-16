import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import commonEn from './locales/en/common.json';
import commonAr from './locales/ar/common.json';
import publicEn from './locales/en/public.json';
import publicAr from './locales/ar/public.json';
import authEn from './locales/en/auth.json';
import authAr from './locales/ar/auth.json';
import userEn from './locales/en/user.json';
import userAr from './locales/ar/user.json';
import adminEn from './locales/en/admin.json';
import adminAr from './locales/ar/admin.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: commonEn, public: publicEn, auth: authEn, user: userEn, admin: adminEn },
      ar: { common: commonAr, public: publicAr, auth: authAr, user: userAr, admin: adminAr },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'ar'],
    defaultNS: 'common',
    ns: ['common', 'public', 'auth', 'user', 'admin'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
  });

const setDirection = (lng) => {
  const dir = lng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
};

setDirection(i18n.language);
i18n.on('languageChanged', setDirection);

export default i18n;
