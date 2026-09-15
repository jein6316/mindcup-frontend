import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import ko from './ko.json';
import en from './en.json';

const resources = {
  ko: { translation: ko },
  en: { translation: en },
};

// 기기 시스템 언어 감지
const locales = Localization.getLocales();
const deviceLanguage = locales && locales.length > 0 ? locales[0].languageCode : 'en';
const defaultLang = deviceLanguage === 'ko' ? 'ko' : 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: defaultLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
