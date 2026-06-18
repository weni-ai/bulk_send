import { useI18n } from 'vue-i18n';

export const VARIABLE_LABEL_KEY =
  'new_broadcast.pages.select_variables.variable_label' as const;

export function useVariableLabel() {
  const { t } = useI18n();

  function getVariableLabel(index: number): string {
    return t(VARIABLE_LABEL_KEY, {
      placeholder: `{{${index}}}`,
    });
  }

  return { getVariableLabel };
}
