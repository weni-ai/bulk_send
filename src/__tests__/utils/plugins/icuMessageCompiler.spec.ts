import { describe, it, expect } from 'vitest';
import { createI18n, type I18nOptions } from 'vue-i18n';
import {
  icuMessageCompiler,
  shouldUseIntlMessageFormat,
} from '@/utils/plugins/icuMessageCompiler';

function createTestI18n(locale: string, messages: I18nOptions['messages']) {
  return createI18n({
    legacy: false,
    locale,
    fallbackLocale: 'en',
    messages,
    messageCompiler: icuMessageCompiler,
    warnHtmlInMessage: 'off',
  });
}

describe('shouldUseIntlMessageFormat', () => {
  it('detects ICU plural blocks', () => {
    expect(
      shouldUseIntlMessageFormat(
        '{count, plural, one {# item} other {# items}}',
      ),
    ).toBe(true);
  });

  it('does not false-positive on plain text with comma', () => {
    expect(shouldUseIntlMessageFormat('{user, select another option}')).toBe(
      false,
    );
    expect(shouldUseIntlMessageFormat('{item, plural forms available}')).toBe(
      false,
    );
  });
});

describe('icuMessageCompiler', () => {
  const i18n = createTestI18n('en', {
    en: {
      greeting: 'Hello, {name}!',
      list: 'First: {0}, Second: {1}',
      html: 'Include a <b class="bold">header row</b> with names',
      variable_label: 'Variable {placeholder}',
      plural: '{count, plural, one {{count} contact} other {{count} contacts}}',
    },
    ro: {
      plural:
        '{count, plural, one {{count} contact} few {{count} contacte} other {{count} contacte}}',
    },
  });

  it('resolves plain named interpolation', () => {
    expect(i18n.global.t('greeting', { name: 'Ana' })).toBe('Hello, Ana!');
  });

  it('resolves list interpolation for positional placeholders', () => {
    expect(i18n.global.t('list', ['Alpha', 'Beta'])).toBe(
      'First: Alpha, Second: Beta',
    );
  });

  it('passes HTML through plain messages unchanged', () => {
    expect(i18n.global.t('html')).toBe(
      'Include a <b class="bold">header row</b> with names',
    );
  });

  it('resolves variable_label placeholder param', () => {
    expect(i18n.global.t('variable_label', { placeholder: '{{1}}' })).toBe(
      'Variable {{1}}',
    );
  });

  it('resolves ICU plural one/other in English', () => {
    expect(i18n.global.t('plural', { count: 1 })).toBe('1 contact');
    expect(i18n.global.t('plural', { count: 5 })).toBe('5 contacts');
    expect(i18n.global.t('plural', { count: 0 })).toBe('0 contacts');
  });

  it('resolves ICU plural one/few/other in Romanian', () => {
    i18n.global.locale.value = 'ro';
    expect(i18n.global.t('plural', { count: 1 })).toBe('1 contact');
    expect(i18n.global.t('plural', { count: 2 })).toBe('2 contacte');
    expect(i18n.global.t('plural', { count: 5 })).toBe('5 contacte');
    i18n.global.locale.value = 'en';
  });

  it('keeps unprovided named placeholders literal', () => {
    expect(i18n.global.t('greeting')).toBe('Hello, {name}!');
  });
});

describe('icuMessageCompiler with project locales', () => {
  it('renders converted group_count plural from locale files', async () => {
    const en = (await import('@/locales/en.json')).default;
    const ro = (await import('@/locales/ro.json')).default;
    const i18n = createTestI18n('en', { en, ro });

    expect(
      i18n.global.t('new_broadcast.pages.select_groups.group_count', {
        count: 1,
      }),
    ).toBe('1 contact');
    expect(
      i18n.global.t('new_broadcast.pages.select_groups.group_count', {
        count: 3,
      }),
    ).toBe('3 contacts');

    i18n.global.locale.value = 'ro';
    expect(
      i18n.global.t('new_broadcast.pages.select_groups.group_count', {
        count: 2,
      }),
    ).toBe('2 contacte');
  });
});
