import { ref } from 'vue';
import { defineStore } from 'pinia';
import FlowsAPI from '@/api/resources/flows';
import type { FlowReference } from '@/types/flow';

export const useFlowsStore = defineStore('flows', () => {
  const flows = ref<FlowReference[]>([]);
  const loadingFlows = ref(false);

  const fetchFlows = async () => {
    loadingFlows.value = true;
    const response = await FlowsAPI.getFlows();
    flows.value = response.data.results;
    loadingFlows.value = false;
  };

  const listAllFlows = async () => {
    loadingFlows.value = true;
    const response = await FlowsAPI.listAllFlows();
    flows.value = response;
    loadingFlows.value = false;
  };

  return { flows, fetchFlows, loadingFlows, listAllFlows };
});
