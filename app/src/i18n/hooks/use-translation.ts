import { useTranslation as useI18nTranslation } from 'react-i18next';

export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();

  return {
    t,
    language: i18n.language,
    isVietnamese: i18n.language === 'vi',
    isEnglish: i18n.language === 'en',
  };
};
