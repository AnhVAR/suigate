import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import vi from './locales/vi.json';

const LANGUAGE_KEY = '@suigate:language';

const resources = {
  en: { translation: en },
  vi: { translation: vi },
};

// Get saved language or use device locale
const getInitialLanguage = async (): Promise<string> => {
  try {
    const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (saved && (saved === 'en' || saved === 'vi')) {
      return saved;
    }
  } catch (error) {
    console.error('Failed to get saved language:', error);
  }

  // Fallback to device locale
  const deviceLocale = Localization.getLocales()[0]?.languageCode || 'en';
  return deviceLocale === 'vi' ? 'vi' : 'en';
};

// Initialize i18n
const initI18n = async () => {
  const lng = await getInitialLanguage();

  await i18n.use(initReactI18next).init({
    resources,
    lng,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });
};

// Change language and persist
export const changeLanguage = async (lang: 'en' | 'vi') => {
  await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  await i18n.changeLanguage(lang);
};

export const getCurrentLanguage = (): string => {
  return i18n.language;
};

// Initialize on import
initI18n();

export default i18n;
