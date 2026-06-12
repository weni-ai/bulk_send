import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  useVariableLabel,
  VARIABLE_LABEL_KEY,
} from '@/components/NewBroadcast/VariablesSelection/composables/useVariableLabel';

const mockT = vi.fn();

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: mockT }),
}));

describe('useVariableLabel', () => {
  beforeEach(() => {
    mockT.mockReset();
  });

  it('calls t with the variable label key and WhatsApp placeholder format', () => {
    mockT.mockReturnValue('Variable {{1}}');

    const { getVariableLabel } = useVariableLabel();
    const result = getVariableLabel(1);

    expect(mockT).toHaveBeenCalledWith(VARIABLE_LABEL_KEY, {
      placeholder: '{{1}}',
    });
    expect(result).toBe('Variable {{1}}');
  });

  it('uses the provided index in the placeholder', () => {
    mockT.mockReturnValue('Variable {{3}}');

    const { getVariableLabel } = useVariableLabel();
    getVariableLabel(3);

    expect(mockT).toHaveBeenCalledWith(VARIABLE_LABEL_KEY, {
      placeholder: '{{3}}',
    });
  });
});
