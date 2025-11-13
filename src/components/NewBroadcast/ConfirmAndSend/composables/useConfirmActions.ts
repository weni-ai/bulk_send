import { computed, ref } from 'vue';
import { ProjectType } from '@/constants/project';
import { NewBroadcastPage } from '@/constants/broadcasts';
import type { Template } from '@/types/template';
import type { ContactField } from '@/types/contacts';
import type { BroadcastsStore } from '@/stores/broadcasts';
import type { ContactImportStore } from '@/stores/contactImport';
import type { ProjectStore } from '@/stores/project';
import {
  createVariablesList,
  requiresVariables,
} from '@/components/NewBroadcast/ConfirmAndSend/domain/variables';
import { ContactImportStatus } from '@/types/contactImport';
import { useRouter } from 'vue-router';

type TranslateFn = (key: string, params?: Record<string, unknown>) => string;

export function useConfirmActions(args: {
  t: TranslateFn;
  broadcastsStore: BroadcastsStore;
  contactImportStore: ContactImportStore;
  projectStore: ProjectStore;
}) {
  const { t, broadcastsStore, contactImportStore, projectStore } = args;
  const router = useRouter();

  const broadcastErrored = ref<Error | undefined>(undefined);
  const broadcastSuccess = ref(false);

  const loadingCreateBroadcast = computed(() => {
    return broadcastsStore.loadingCreateBroadcast;
  });

  const projectType = computed<ProjectType>(() => {
    return projectStore.project.brainOn ? ProjectType.AB : ProjectType.FLOW;
  });

  const canContinue = computed(() => {
    let canConfirm = true;

    if (contactImportStore.import) {
      canConfirm =
        contactImportStore.contactImportInfo.status ===
        ContactImportStatus.COMPLETE;
    }

    return canConfirm && broadcastsStore.newBroadcast.reviewed;
  });

  const contactCount = computed(() => {
    if (contactImportStore.import) {
      return contactImportStore.import.numRecords;
    } else {
      return broadcastsStore.newBroadcast.selectedGroups.reduce(
        (acc: number, group: { memberCount: number }) =>
          acc + group.memberCount,
        0,
      );
    }
  });

  const handleCancel = () => {
    broadcastsStore.setReviewed(false);
    broadcastsStore.setSelectedFlow(undefined);
    broadcastsStore.setBroadcastName('');

    const template: Template | undefined =
      broadcastsStore.newBroadcast.selectedTemplate;
    const hasHeader = !!broadcastsStore.newBroadcast.headerMediaFileUrl;
    const needsVariables = !!(template && requiresVariables(template));

    if (needsVariables || hasHeader) {
      broadcastsStore.setNewBroadcastPage(NewBroadcastPage.SELECT_VARIABLES);
    } else {
      broadcastsStore.setNewBroadcastPage(NewBroadcastPage.SELECT_TEMPLATE);
    }
  };

  const getSelectedGroups = async (): Promise<string[]> => {
    if (contactImportStore.import) {
      await contactImportStore.getImportInfo(
        contactImportStore.import.importId,
      );

      if (!contactImportStore.contactImportGroup?.uuid) {
        throw new Error('Contact import group uuid not found');
      }

      return [contactImportStore.contactImportGroup.uuid];
    } else {
      return broadcastsStore.newBroadcast.selectedGroups.map(
        (group: { uuid: string }) => group.uuid,
      );
    }
  };

  const handleErrorBack = () => {
    broadcastErrored.value = undefined;
  };

  const handleSuccessBack = () => {
    broadcastSuccess.value = false;
    broadcastsStore.resetNewBroadcast();
    router.push({ name: 'HomeBulkSend' });
  };

  const handleContinue = async () => {
    try {
      const groups = await getSelectedGroups();
      if (!groups || groups.length === 0) {
        throw new Error(
          t('new_broadcast.pages.confirm_and_send.groups_not_found'),
        );
      }

      const name: string = broadcastsStore.newBroadcast.broadcastName.trim();
      if (!name) {
        throw new Error(
          t('new_broadcast.pages.confirm_and_send.name_not_found'),
        );
      }

      const template: Template | undefined =
        broadcastsStore.newBroadcast.selectedTemplate;
      if (!template) {
        throw new Error(
          t('new_broadcast.pages.confirm_and_send.template_not_found'),
        );
      }

      const variablesMapping: Record<number, ContactField | undefined> =
        broadcastsStore.newBroadcast.variableMapping;
      const variables = createVariablesList(variablesMapping);

      if (
        requiresVariables(template) &&
        (!variables || variables.length === 0)
      ) {
        throw new Error(
          t('new_broadcast.pages.confirm_and_send.variables_not_found'),
        );
      }

      let attachment: { url: string; type: string } | undefined = undefined;
      if (broadcastsStore.newBroadcast.headerMediaFileUrl) {
        attachment = {
          url: broadcastsStore.newBroadcast.headerMediaFileUrl!,
          type: broadcastsStore.newBroadcast.headerMediaFileType!,
        };
      }

      const flow = broadcastsStore.newBroadcast.selectedFlow;
      if (projectType.value === ProjectType.FLOW && !flow) {
        throw new Error(
          t('new_broadcast.pages.confirm_and_send.flow_not_found'),
        );
      }

      await broadcastsStore.createBroadcast(
        name,
        template,
        variables,
        groups,
        attachment,
        flow,
      );
      broadcastSuccess.value = true;
    } catch (error: unknown) {
      if (error instanceof Error) {
        broadcastErrored.value = error;
      } else {
        broadcastErrored.value = new Error(
          t('new_broadcast.pages.confirm_and_send.unknown_error'),
        );
      }
    }
  };

  return {
    loadingCreateBroadcast,
    canContinue,
    handleCancel,
    handleContinue,
    handleSuccessBack,
    handleErrorBack,
    broadcastErrored,
    broadcastSuccess,
    contactCount,
  };
}
