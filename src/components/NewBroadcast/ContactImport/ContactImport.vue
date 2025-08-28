<template>
  <UnnnicCollapse
    :modelValue="open"
    @update:model-value="handleCollapseUpdate"
  >
    <template #header>
      <h1 class="contact-import__title">
        {{ $t('new_broadcast.pages.contact_import.title') }}
      </h1>
    </template>
    <section class="contact-import__content">
      <!-- TODO: Add content -->
    </section>
  </UnnnicCollapse>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean;
}>();

const emit = defineEmits(['update:open']);

const handleCollapseUpdate = (value: boolean) => {
  emit('update:open', value);
};
</script>
