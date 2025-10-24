import type { ContactField } from '@/types/contacts';
import type { Template } from '@/types/template';
import { NAME_FIELD_VALUE } from '@/constants/broadcasts';

export function requiresVariables(template: Template): boolean {
  return !!(template.variableCount && template.variableCount > 0);
}

export function hasIncompleteMapping(
  variablesMapping: Record<number, ContactField | undefined>,
): boolean {
  return Object.values(variablesMapping).some(
    (variable) => variable === undefined,
  );
}

export function createVariablesList(
  variablesMapping: Record<number, ContactField | undefined>,
): string[] {
  if (!variablesMapping) {
    throw new Error('Variables mapping not found');
  }

  if (hasIncompleteMapping(variablesMapping)) {
    throw new Error('Variables mapping is not complete');
  }

  const variables: string[] = [];

  for (let i = 0; i < Object.keys(variablesMapping).length; i++) {
    const mapping = variablesMapping[i]!;
    if (mapping.key === NAME_FIELD_VALUE) {
      variables.push('@contact.name');
      continue;
    }

    variables.push(`@fields.${mapping.key}`);
  }

  return variables;
}
