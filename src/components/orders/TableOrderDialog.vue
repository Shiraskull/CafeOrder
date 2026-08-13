<script setup>
import { useOrderStore } from '@/plugins/store/orderStore'
import { computed } from 'vue'

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

/** id order yang akan diselesaikan (bisa 1 atau banyak) */
const pendingSelesaiIds = ref([])
const isConfirmSelesaiOpen = ref(false)
const isUpdating = ref(false)

const snackbarShow = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

const showSnackbar = (msg, color = 'success') => {
  snackbarText.value = String(msg || '')
  snackbarColor.value = color
  snackbarShow.value = true
}

const resolveErrorMessage = err =>
  err?.response?.data?.message
  || err?.message
  || 'Terjadi kesalahan'

const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const currentTableOrders = computed(() => {
  if (!props.table)
    return []

  const all = orderStore.orders.find(meja => meja.nomor === props.table.id)?.orders || []

  // Sama seperti cashierOrders: jangan tampilkan yang sudah selesai
  return all.filter(order => ['order', 'antar'].includes(order.status))
})

/** Selalu dari store agar status live setelah Antar/Selesai */
const orderGroups = computed(() => {
  if (!props.table)
    return []

  const source = currentTableOrders.value.length
    ? currentTableOrders.value
    : (props.table.orderGroups || []).map(g => ({
      id: g.id_order,
      status: g.status,
      waktu: g.waktu,
      items: g.items,
    }))

  return source.map(orderItem => {
    const items = (orderItem.items || []).map((item, index) => ({
      id: item.id || `${orderItem.id}-${index}`,
      name: item.name,
      qty: item.qty,
      price: Number(item.price || 0),
      note: item.note || item.catatan || '',
    }))

    return {
      id_order: orderItem.id ?? orderItem.id_order,
      status: orderItem.status,
      waktu: orderItem.waktu,
      items,
      total: items.reduce((sum, item) => sum + item.qty * item.price, 0),
    }
  })
})

const grandTotal = computed(() =>
  orderGroups.value.reduce((sum, group) => sum + (group.total || 0), 0),
)

const ordersWithStatus = status =>
  currentTableOrders.value.filter(order => order.status === status)

/** Antar Semua: semua pesanan di meja masih status order */
const canAntarSemua = computed(() => {
  const list = currentTableOrders.value
  return list.length > 0 && list.every(order => order.status === 'order')
})

/** Selesai (per meja): semua pesanan di meja sudah diantar */
const canSelesaiMeja = computed(() => {
  const list = currentTableOrders.value
  return list.length > 0 && list.every(order => order.status === 'antar')
})

const confirmSelesaiQuestion = computed(() => {
  const ids = pendingSelesaiIds.value
  if (ids.length > 1)
    return `Yakin menyelesaikan semua pesanan di meja ini (${ids.length} pesanan)?`

  if (ids.length === 1)
    return `Yakin menyelesaikan pesanan di meja ini?`

  return 'Yakin menyelesaikan pesanan di meja ini?'
})

const statusLabel = status => {
  const labels = {
    order: 'Order',
    antar: 'Di Antar',
    selesai: 'Selesai',
    batal: 'Batal',
  }

  return labels[status] || status || '-'
}

const statusColor = status => {
  if (status === 'order')
    return 'warning'
  if (status === 'antar')
    return 'success'

  return 'info'
}

const openConfirmSelesai = orderIds => {
  pendingSelesaiIds.value = orderIds.map(String)
  isConfirmSelesaiOpen.value = true
}

const closeConfirmSelesai = () => {
  isConfirmSelesaiOpen.value = false
  pendingSelesaiIds.value = []
}

const handleAntarOrder = async orderId => {
  if (isUpdating.value)
    return

  isUpdating.value = true
  try {
    await orderStore.sendOrder(String(orderId))
    showSnackbar(`Order ${orderId} berhasil diantar`, 'success')
  }
  catch (err) {
    console.error('Gagal antar order:', err)
    showSnackbar(resolveErrorMessage(err), 'error')
  }
  finally {
    isUpdating.value = false
  }
}

const handleAntarSemua = async () => {
  if (isUpdating.value || !canAntarSemua.value)
    return

  const targets = ordersWithStatus('order')
  if (!targets.length)
    return

  isUpdating.value = true
  try {
    await Promise.all(targets.map(order => orderStore.sendOrder(order.id)))
    showSnackbar(`${targets.length} order berhasil diantar`, 'success')
  }
  catch (err) {
    console.error('Gagal antar semua:', err)
    showSnackbar(resolveErrorMessage(err), 'error')
  }
  finally {
    isUpdating.value = false
  }
}

const handleSelesaiMeja = () => {
  if (!canSelesaiMeja.value)
    return

  const antarOrders = ordersWithStatus('antar')
  if (!antarOrders.length)
    return

  openConfirmSelesai(antarOrders.map(o => o.id))
}

const onConfirmSelesai = async () => {
  if (isUpdating.value)
    return

  const ids = [...pendingSelesaiIds.value]
  if (!ids.length)
    return

  isUpdating.value = true
  try {
    await Promise.all(ids.map(id => orderStore.markAsPaid(id)))
    isConfirmSelesaiOpen.value = false
    pendingSelesaiIds.value = []
    showSnackbar(
      ids.length > 1
        ? `${ids.length} order berhasil diselesaikan`
        : `Order ${ids[0]} berhasil diselesaikan`,
      'success',
    )

    const stillActive = currentTableOrders.value.some(o =>
      ['order', 'antar'].includes(o.status),
    )
    if (!stillActive)
      isOpen.value = false
  }
  catch (err) {
    console.error('Gagal selesaikan order:', err)
    showSnackbar(resolveErrorMessage(err), 'error')
  }
  finally {
    isUpdating.value = false
  }
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
            <div class="d-flex align-center justify-space-between flex-wrap gap-2 w-100">
              <span class="text-subtitle-2 font-weight-bold">Order {{ group.id_order }}</span>
              <div class="d-flex align-center ga-2 flex-wrap">
                <VChip
                  size="small"
                  :color="statusColor(group.status)"
                  variant="tonal"
                >
                  {{ statusLabel(group.status) }}
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

            <div
              v-if="group.status === 'order'"
              class="d-flex justify-end ga-2 mt-3"
            >
              <VBtn
                size="small"
                color="warning"
                variant="tonal"
                :loading="isUpdating"
                :disabled="isUpdating"
                @click="handleAntarOrder(group.id_order)"
              >
                Antar
              </VBtn>
            </div>
          </VCardText>
        </AppCardActions>
      </VCardText>

      <VDivider />

      <VCardText class="d-flex align-center justify-space-between">
        <strong>Total</strong>
        <strong>Rp {{ grandTotal.toLocaleString('id-ID') }}</strong>
      </VCardText>

      <VCardActions class="flex-wrap ga-2">
        <VBtn
          color="warning"
          variant="tonal"
          :disabled="!canAntarSemua || isUpdating"
          :loading="isUpdating"
          @click="handleAntarSemua"
        >
          Antar Semua
        </VBtn>
        <VBtn
          color="success"
          variant="tonal"
          :disabled="!canSelesaiMeja || isUpdating"
          @click="handleSelesaiMeja"
        >
          Selesai Semua
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

  <VDialog
    v-model="isConfirmSelesaiOpen"
    max-width="420"
    persistent
  >
    <VCard>
      <VCardTitle>Konfirmasi</VCardTitle>
      <VCardText>
        {{ confirmSelesaiQuestion }}
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn
          variant="text"
          :disabled="isUpdating"
          @click="closeConfirmSelesai"
        >
          Batal
        </VBtn>
        <VBtn
          color="success"
          variant="tonal"
          :loading="isUpdating"
          :disabled="isUpdating"
          @click="onConfirmSelesai"
        >
          Ya, Selesaikan
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <VSnackbar
    v-model="snackbarShow"
    :color="snackbarColor"
    location="top"
    :timeout="3000"
  >
    {{ snackbarText }}
  </VSnackbar>
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
