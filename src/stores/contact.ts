import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  type ContactField,
  type ContactFieldWithExample,
} from '@/types/contacts';
import ContactAPI from '@/api/resources/flows/contacts';
import type { Group } from '@/types/groups';

export const useContactStore = defineStore('contact', () => {
  const contactFields = ref<ContactField[]>([]);
  const loadingContactFields = ref(false);
  const contactFieldsExamples = ref<ContactFieldWithExample[]>([]);
  const loadingContactFieldsExamples = ref(false);

  const fetchContactFields = async () => {
    loadingContactFields.value = true;
    try {
      const response = await ContactAPI.getContactFields();
      contactFields.value = response.data.results;
    } catch (error) {
      console.error(error); // TODO: handle error
    } finally {
      loadingContactFields.value = false;
    }
  };

  const getContactFieldsExamplesByGroups = async (groups: Group[]) => {
    loadingContactFieldsExamples.value = true;
    try {
      const response =
        await ContactAPI.getContactFieldsExamplesByGroups(groups);
      contactFieldsExamples.value = response.data.results;
    } catch (error) {
      console.error(error); // TODO: handle error
    } finally {
      loadingContactFieldsExamples.value = false;
    }
  };

  return {
    contactFields,
    fetchContactFields,
    loadingContactFields,
    getContactFieldsExamplesByGroups,
    loadingContactFieldsExamples,
    contactFieldsExamples,
  };
});
