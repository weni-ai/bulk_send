import i18n from '@/utils/plugins/i18n';

const toPercentage = (value: number): string => {
  return `${value.toLocaleString(i18n.global.locale || undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
};

export { toPercentage };
