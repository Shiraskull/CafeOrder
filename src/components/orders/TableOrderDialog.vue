<script setup>
import { useOrderStore } from '@/plugins/store/orderStore'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  table: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue'])
const orderStore = useOrderStore()

const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const grandTotal = computed(() => {
  if (!props.table)
    return 0

  return props.table.orders.reduce((sum, item) => sum + item.qty * item.price, 0)
})

const currentTableOrders = computed(() => {
  if (!props.table)
    return []

  return orderStore.orders.filter(order => order.meja === props.table.id)
})

const hasOrderStatus = computed(() => currentTableOrders.value.some(order => order.status === 'order'))
const hasAntarStatus = computed(() => currentTableOrders.value.some(order => order.status === 'antar'))

const actionLabel = computed(() => {
  if (hasOrderStatus.value)
    return 'Antar'
  if (hasAntarStatus.value)
    return 'Selesai'

  return 'Selesai'
})

const canProcessOrder = computed(() => hasOrderStatus.value || hasAntarStatus.value)

const handleProcessOrder = () => {
  if (!props.table || !canProcessOrder.value)
    return

  if (hasOrderStatus.value) {
    currentTableOrders.value
      .filter(order => order.status === 'order')
      .forEach(order => orderStore.sendOrder(order.id))
  }
  else if (hasAntarStatus.value) {
    currentTableOrders.value
      .filter(order => order.status === 'antar')
      .forEach(order => orderStore.markAsPaid(order.id))
  }

  isOpen.value = false
}
</script>

<template>
  <VDialog
    v-model="isOpen"
    max-width="600"
  >
    <VCard v-if="table">
      <VCardItem>
        <VCardTitle>Detail Pesanan - Meja {{ table.number }}</VCardTitle>
      </VCardItem>

      <VCardText>
        <VList lines="two">
          <VListItem
            v-for="item in table.orders"
            :key="item.id"
          >
            <template #prepend>
              <VAvatar
                size="28"
                color="primary"
                variant="tonal"
              >
                {{ item.qty }}x
              </VAvatar>
            </template>

            <VListItemTitle>{{ item.name }}</VListItemTitle>
            <VListItemSubtitle>
              Rp {{ item.price.toLocaleString('id-ID') }}
              <span v-if="item.note">• Catatan: {{ item.note }}</span>
            </VListItemSubtitle>

            <template #append>
              <div class="text-body-2">
                Rp {{ (item.qty * item.price).toLocaleString('id-ID') }}
              </div>
            </template>
          </VListItem>
        </VList>
      </VCardText>

      <VDivider />

      <VCardText class="d-flex align-center justify-space-between">
        <strong>Total</strong>
        <strong>Rp {{ grandTotal.toLocaleString('id-ID') }}</strong>
      </VCardText>

      <VCardActions>
        <VBtn
          color="success"
          variant="tonal"
          :disabled="!canProcessOrder"
          @click="handleProcessOrder"
        >
          {{ actionLabel }}
        </VBtn>
        <VSpacer />
        <VBtn
          variant="text"
          @click="isOpen = false"
        >
          Tutup
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
