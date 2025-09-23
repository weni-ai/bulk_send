import i18n from '@/utils/plugins/i18n';

const toLocalizedFloat = (value: number): string => {
  return value.toLocaleString(i18n.global.locale || undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const toPercentage = (value: number): string => {
  return `${toLocalizedFloat(value)}%`;
};

export { toPercentage, toLocalizedFloat };
