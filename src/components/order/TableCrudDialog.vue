<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  /** 'create' | 'edit' */
  mode: {
    type: String,
    default: 'create',
  },
  /** Untuk edit: { tableName } */
  initial: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const tableName = ref('')

const title = computed(() => (props.mode === 'create' ? 'Tambah meja' : 'Ubah meja'))

watch(
  () => [props.modelValue, props.mode, props.initial],
  () => {
    if (!props.modelValue)
      return
    if (props.mode === 'edit' && props.initial)
      tableName.value = props.initial.tableName ?? ''
    else
      tableName.value = ''
  },
  { immediate: true },
)

const close = () => {
  emit('update:modelValue', false)
}

const onSubmit = () => {
  emit('submit', {
    table_name: tableName.value.trim(),
  })
}
</script>

<template>
  <VDialog
    :model-value="modelValue"
    max-width="480"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between">
        <span>{{ title }}</span>
        <VBtn
          icon
          variant="text"
          size="small"
          @click="close"
        >
          <VIcon icon="tabler-x" />
        </VBtn>
      </VCardTitle>
      <VDivider />
      <VCardText class="pt-4">
        <VTextField
          v-model="tableName"
          label="Nama meja"
          placeholder="Contoh: Meja 1"
          density="comfortable"
        />
      </VCardText>
      <VCardActions class="px-4 pb-4">
        <VSpacer />
        <VBtn
          variant="text"
          @click="close"
        >
          Batal
        </VBtn>
        <VBtn
          color="primary"
          :loading="loading"
          @click="onSubmit"
        >
          Simpan
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
