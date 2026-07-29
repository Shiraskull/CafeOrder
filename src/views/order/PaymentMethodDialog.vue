<script setup>
import { computed } from 'vue'
import PaymentMethodForm from './PaymentMethodForm.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  total: {
    type: Number,
    default: 0,
  },
  qrisImageUrl: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

function onConfirm(payload) {
  emit('confirm', payload)
  isOpen.value = false
}

function onClose() {
  isOpen.value = false
}
</script>

<template>
  <VDialog
    v-model="isOpen"
    max-width="480"
    persistent
    @click:outside="onClose"
  >
    <VCard>
      <VCardItem class="d-flex align-center">
        <VCardTitle class="text-h6">
          Pembayaran
        </VCardTitle>
        <VSpacer />
        <VBtn
          icon
          variant="text"
          size="small"
          @click="onClose"
        >
          <VIcon icon="tabler-x" />
        </VBtn>
      </VCardItem>

      <VDivider />

      <VCardText class="pt-4">
        <PaymentMethodForm
          :total="total"
          :qris-image-url="qrisImageUrl"
          :show-cancel="true"
          no-card
          @confirm="onConfirm"
          @cancel="onClose"
        />
      </VCardText>
    </VCard>
  </VDialog>
</template>
