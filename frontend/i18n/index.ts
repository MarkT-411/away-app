import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';

// Import all translation files
import en from './en.json';
import it from './it.json';
import es from './es.json';
import fr from './fr.json';
import de from './de.json';
import pt from './pt.json';
import zh from './zh.json';
import ja from './ja.json';
import hi from './hi.json';
import tr from './tr.json';
import el from './el.json';
import ar from './ar.json';
import pl from './pl.json';
import ru from './ru.json';

// Create i18n instance with all translations
const i18n = new I18n({
  en,
  it,
  es,
  fr,
  de,
  pt,
  zh,
  ja,
  hi,
  tr,
  el,
  ar,
  pl,
  ru,
});

// Set default locale to device locale or English
i18n.defaultLocale = 'en';
i18n.locale = Localization.getLocales()[0]?.languageCode || 'en';

// Enable fallback to default locale when translation is missing
i18n.enableFallback = true;

export default i18n;

// Helper function to change locale
export const setLocale = (locale: string) => {
  i18n.locale = locale;
};

// Helper function to get current locale
export const getLocale = () => i18n.locale;

// Shorthand translation function
export const t = (key: string, options?: object) => i18n.t(key, options);
