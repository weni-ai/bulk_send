<template>
  <section class="recent-sends-list">
    <section
      v-if="!loading"
      class="recent-sends-list__content"
    >
      <section v-if="recentSends.length > 0">
        <SendElement
          v-for="send in recentSends"
          :key="send.id"
          :send="send"
        />
      </section>
      <section
        v-else
        class="recent-sends-list__empty"
      >
        <p class="recent-sends-list__empty-text">
          {{ $t('home.recent_sends.empty_text') }}
        </p>
        <UnnnicButton
          :text="$t('home.recent_sends.refresh')"
          type="secondary"
          @click="() => handlePageUpdate(page)"
        />
      </section>
    </section>
    <section
      v-else
      class="recent-sends-list__content"
    >
      <UnnnicSkeletonLoading
        v-for="i in pageSize"
        :key="i"
        width="100%"
        height="62px"
      />
    </section>

    <footer
      v-if="recentSends.length > 0"
      class="recent-sends-list__footer"
    >
      <p class="recent-sends-list__pagination-text">
        {{
          $t('home.recent_sends.pagination_text', { currentPageOffset, total })
        }}
      </p>
      <UnnnicPagination
        class="recent-sends-list__pagination"
        :max="pageLimit"
        :modelValue="page"
        @update:model-value="handlePageUpdate"
      />
    </footer>
  </section>
</template>

<script setup lang="ts">
import SendElement from '@/components/HomeBulkSend/SendElement.vue';
import type { BroadcastStatistic } from '@/types/broadcast';
import { computed } from 'vue';

const props = defineProps<{
  loading: boolean;
  recentSends: BroadcastStatistic[];
  page: number;
  pageSize: number;
  total: number;
}>();

const emit = defineEmits(['update:page']);

const currentPageOffset = computed(() => {
  return Math.min(
    (props.page - 1) * props.pageSize + props.recentSends.length,
    props.total,
  );
});

const pageLimit = computed(() => {
  return Math.ceil(props.total / props.pageSize);
});

const handlePageUpdate = (newPage: number) => {
  emit('update:page', newPage);
};
</script>

<style scoped lang="scss">
.recent-sends-list {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-md;

  &__content {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-xs;
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__pagination {
    margin-left: auto;
  }

  &__pagination-text {
    font-size: $unnnic-font-size-body-md;
    color: $unnnic-color-neutral-cloudy;
    line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $unnnic-spacing-sm;
    padding: $unnnic-spacing-sm 0;

    color: $unnnic-color-neutral-cloudy;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  }
}
</style>
