import { createI18n } from 'vue-i18n';

import pt_br from '@/locales/pt_br.json';
import en from '@/locales/en.json';
import es from '@/locales/es.json';
import ro from '@/locales/ro.json';
import { icuMessageCompiler } from '@/utils/plugins/icuMessageCompiler';

const languages = {
  'pt-br': pt_br,
  en,
  es,
  ro,
};

const messages = Object.assign(languages);

export default createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages,
  messageCompiler: icuMessageCompiler,
  warnHtmlInMessage: 'off',
  silentTranslationWarn: true,
  silentFallbackWarn: true,
});
