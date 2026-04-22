import { useTranslation } from 'react-i18next';

/**
 * Hook to get localized field from a database object.
 * Database stores name_en/name_ar, description_en/description_ar, etc.
 * 
 * Usage:
 *   const localize = useLocalizedField();
 *   localize(category, 'name')       → category.name_ar or category.name_en
 *   localize(category, 'description') → category.description_ar or category.description_en
 */
export const useLocalizedField = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  return (item, field) => {
    if (!item) return '';
    const localizedKey = `${field}_${lang}`;
    const fallbackKey = `${field}_en`;
    return item[localizedKey] || item[fallbackKey] || item[field] || '';
  };
};

export default useLocalizedField;
