<template>
  <footer
    v-if="groups.length > 0"
    class="group-selection-list__footer"
    data-test="footer"
  >
    <p
      class="group-selection-list__pagination-text"
      data-test="pagination-text"
    >
      {{
        $t('new_broadcast.pages.select_groups.pagination_text', {
          currentPageOffset,
          total,
        })
      }}
    </p>
    <UnnnicPagination
      class="recent-sends-list__pagination"
      :max="pageLimit"
      :modelValue="page"
      @update:model-value="handlePageUpdate"
    />
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGroupsStore } from '@/stores/groups';

const groupsStore = useGroupsStore();

const props = defineProps<{
  page: number;
  pageSize: number;
  total: number;
}>();

const emit = defineEmits(['update:page']);

const groups = computed(() => groupsStore.groups);

const currentPageOffset = computed(() => {
  return Math.min(
    (props.page - 1) * props.pageSize + groups.value.length,
    props.total,
  );
});

const pageLimit = computed(() => {
  return Math.ceil(props.total / props.pageSize);
});

const handlePageUpdate = (page: number) => {
  emit('update:page', page);
};
</script>
