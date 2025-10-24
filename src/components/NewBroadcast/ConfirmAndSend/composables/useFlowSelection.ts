import { computed } from 'vue';
import type { SelectOption } from '@/types/select';
import type { FlowsStore } from '@/stores/flows';
import type { BroadcastsStore } from '@/stores/broadcasts';
import type { FlowReference } from '@/types/flow';

type FlowOption = SelectOption<string>;

export function useFlowSelection(
  flowsStore: FlowsStore,
  broadcastsStore: BroadcastsStore,
) {
  const loadingFlows = computed(() => {
    return flowsStore.loadingFlows;
  });

  const projectFlowsOptions = computed<FlowOption[]>(() => {
    return flowsStore.flows.map((flow: FlowReference) => ({
      label: flow.name,
      value: flow.uuid,
    }));
  });

  const selectedFlowOption = computed<FlowOption[]>(() => {
    if (!broadcastsStore.newBroadcast.selectedFlow) {
      return [];
    }

    return [
      {
        label: broadcastsStore.newBroadcast.selectedFlow.name,
        value: broadcastsStore.newBroadcast.selectedFlow.uuid,
      },
    ];
  });

  const handleFlowSelectUpdate = (selection: FlowOption[]) => {
    const flowUuid = selection[0].value;
    const flow = flowsStore.flows.find(
      (flow: FlowReference) => flow.uuid === flowUuid,
    );
    broadcastsStore.setSelectedFlow(flow);
  };

  return {
    loadingFlows,
    projectFlowsOptions,
    selectedFlowOption,
    handleFlowSelectUpdate,
  };
}
