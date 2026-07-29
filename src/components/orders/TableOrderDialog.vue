<script setup>
import { useOrderStore } from '@/plugins/store/orderStore'
import { computed } from 'vue'
import PaymentMethodDialog from '@/views/order/PaymentMethodDialog.vue'

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

const isPaymentDialogOpen = ref(false)

const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const grandTotal = computed(() => {
  if (!props.table)
    return 0

  return props.table.orderGroups?.reduce((sum, group) => sum + (group.total || 0), 0)
    ?? props.table.orders.reduce((sum, item) => sum + item.qty * item.price, 0)
})

const currentTableOrders = computed(() => {
  if (!props.table)
    return []

  return orderStore.orders.find(meja => meja.nomor === props.table.id)?.orders || []
})

const hasOrderStatus = computed(() => currentTableOrders.value.some(order => order.status === 'order'))
const hasAntarStatus = computed(() => currentTableOrders.value.some(order => order.status === 'antar'))

const orderGroups = computed(() => {
  if (!props.table)
    return []

  if (props.table.orderGroups?.length)
    return props.table.orderGroups

  // fallback: build from store (kalau modal dipakai dari page lain)
  return currentTableOrders.value.map(orderItem => {
    const items = (orderItem.items || []).map((item, index) => ({
      id: `${orderItem.id}-${index}`,
      name: item.name,
      qty: item.qty,
      price: Number(item.price || 0),
      note: item.note || item.catatan || '',
    }))

    return {
      id_order: orderItem.id,
      status: orderItem.status,
      waktu: orderItem.waktu,
      items,
      total: items.reduce((sum, item) => sum + item.qty * item.price, 0),
    }
  })
})

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
    isOpen.value = false
  }
  else if (hasAntarStatus.value) {
    isPaymentDialogOpen.value = true
  }
}

const onPaymentConfirm = () => {
  currentTableOrders.value
    .filter(order => order.status === 'antar')
    .forEach(order => orderStore.markAsPaid(order.id))
  isPaymentDialogOpen.value = false
  isOpen.value = false
}
</script>

<template>
  <VDialog
    v-model="isOpen"
    max-width="600"
  >
    <VCard v-if="table">
      <VCardItem class="dialog-header">
        <VCardTitle>Detail Pesanan - {{ table.tableName }}</VCardTitle>
      </VCardItem>

      <VCardText class="dialog-body">
        <AppCardActions
          v-for="group in orderGroups"
          :key="group.id_order"
          action-collapsed
          class="mb-4"
        >
          <template #title>
            <div class="d-flex align-center justify-space-between flex-wrap gap-2">
              <span class="text-subtitle-2 font-weight-bold">Order {{ group.id_order }}</span>
              <div class="d-flex align-center ga-2">
                <VChip
                  size="small"
                  :color="group.status === 'order' ? 'warning' : (group.status === 'antar' ? 'success' : 'info')"
                  variant="tonal"
                >
                  {{ group.status }}
                </VChip>
                <span class="text-body-2 font-weight-bold">
                  Rp {{ Number(group.total || 0).toLocaleString('id-ID') }}
                </span>
              </div>
            </div>
          </template>

          <VCardText class="pt-0">
            <div
              v-if="group.waktu"
              class="text-caption text-medium-emphasis mb-2"
            >
              Waktu: {{ new Date(group.waktu).toLocaleString('id-ID') }}
            </div>
            <VList
              lines="two"
              density="compact"
            >
              <VListItem
                v-for="item in group.items"
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
                  Rp {{ Number(item.price || 0).toLocaleString('id-ID') }}
                  <span v-if="item.note">• Catatan: {{ item.note }}</span>
                </VListItemSubtitle>

                <template #append>
                  <div class="text-body-2">
                    Rp {{ (item.qty * Number(item.price || 0)).toLocaleString('id-ID') }}
                  </div>
                </template>
              </VListItem>
            </VList>
          </VCardText>
        </AppCardActions>
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

    <PaymentMethodDialog
      v-model="isPaymentDialogOpen"
      :total="grandTotal"
      @confirm="onPaymentConfirm"
    />
  </VDialog>
</template>

<style scoped>
.dialog-header {
  position: sticky;
  top: 0;
  z-index: 2;
  background: rgb(var(--v-theme-surface));
}

.dialog-body {
  max-height: 60vh;
  overflow-y: auto;
}
</style>
