import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

const resources = {
  en: {
    common: {
      hello: 'Hello,',
      prompt: 'Tell me your situation so we can fill out and submit the required forms together',
      explainPlaceholder: 'Explain your situation',
      or: 'or',
      scanForm: 'scan the form',
    },
  },
  de: {
    common: {
      hello: 'Hallo,',
      prompt: 'Schildern Sie Ihre Situation, damit wir die erforderlichen Formulare gemeinsam ausfüllen und einreichen können',
      explainPlaceholder: 'Beschreiben Sie Ihre Situation',
      or: 'oder',
      scanForm: 'Formular scannen',
    },
  },
};

void i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    resources,
    lng: Localization.getLocales()[0]?.languageCode ?? 'en',
    fallbackLng: 'en',
    ns: ['common'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
  });

export default i18n;