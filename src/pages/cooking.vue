<script setup>
/**
 * Dapur: menampilkan cookingOrders (hanya pesanan status 'order' dari store).
 */
import { useOrderStore } from '@/plugins/store/orderStore'
import { watch, onMounted } from 'vue'

definePage({
  meta: {
    action: 'read',
    subject: 'AclDemo',
  },
})

const orderStore = useOrderStore()

/**
 * Muat pesanan dari API ke store. cookingOrders hanya menampilkan status 'order';
 * tanpa fetchOrder(), daftar dapur tetap kosong meskipun halaman dibuka langsung.
 */
onMounted(() => {
  orderStore.fetchOrder().catch(() => {})
})

// ✅ DEBUG YANG BENAR: PAKAI WATCH (BUKAN CONSOLE.LOG DI ROOT)
watch(() => orderStore.cookingOrders, (newOrders, oldOrders) => {
  console.log('🍳 Cooking orders berubah!', {
    jumlah_lama: oldOrders?.length || 0,
    jumlah_baru: newOrders.length,
    orders: newOrders.map(meja => ({ nomor: meja.nomor, total_orders: meja.orders?.length || 0 })),
  })
  console.log(orderStore.cookingOrders)
  
}, { deep: true, immediate: true })

const parseTableNumber = meja => {
  const matched = String(meja || '').match(/\d+/)
  return matched ? Number(matched[0]) : 0
}

// ✅ COMPUTED UNTUK FORMAT TABEL
const rawTables = computed(() => {
  console.log('📊 rawTables dihitung ulang, data:', orderStore.cookingOrders.length)
  
  return orderStore.cookingOrders
    .map(meja => ({
      id: meja.nomor,
      number: parseTableNumber(meja.nomor),
      orders: (meja.orders || []).flatMap(order =>
        (order.items || []).map((item, index) => ({
          id: `${order.id}-${index}`,
          name: item.name,
          qty: item.qty,
          note: item.note || item.catatan || '',
          image: item.image || '',
        })),
      ),
    }))
    // .sort((a, b) => a.number - b.number)
})

const headerTonePalette = [
  'rgba(22, 163, 74, 0.5)',
  'rgba(37, 99, 235, 0.5)',
  'rgba(234, 179, 8, 0.5)',
  'rgba(219, 39, 119, 0.5)',
  'rgba(124, 58, 237, 0.5)',
  'rgba(8, 145, 178, 0.5)',
]

const headerBgStyle = tableNumber => ({
  backgroundColor: headerTonePalette[(tableNumber - 1) % headerTonePalette.length],
})
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4">
      <h4 class="text-h4">
        Cooking / Koki
      </h4>
      <VChip
        color="warning"
        variant="tonal"
      >
        Cooking
      </VChip>
    </div>

    <VSlideGroup
      v-if="rawTables.length > 0"
      show-arrows
      class="cooking-slider"
    >
      <VSlideGroupItem
        v-for="table in rawTables"
        :key="table.id"
      >
        <div class="slide-item">
          <VCard class="h-100 cooking-card">
            <VCardItem :style="headerBgStyle(table.number)">
              <VCardTitle class="d-flex align-center justify-space-between">
                <span>Meja {{ table.number }}</span>
                <VChip
                  size="small"
                  color="primary"
                  variant="tonal"
                >
                  {{ table.orders.length }} menu
                </VChip>
              </VCardTitle>
            </VCardItem>

            <VCardText class="pt-0 order-list-wrapper">
              <VList
                lines="two"
                density="compact"
                class="order-list"
              >
                <VListItem
                  v-for="item in table.orders"
                  :key="item.id"
                >
                  <template #prepend>
                    <VAvatar
                      size="44"
                      rounded
                      :image="item.image"
                      color="grey-lighten-3"
                    />
                  </template>

                  <VListItemTitle class="item-title">{{ item.name }}</VListItemTitle>
                  <VListItemSubtitle v-if="item.note">
                    Note: {{ item.note }}
                  </VListItemSubtitle>

                  <template #append>
                    <VChip
                      size="small"
                      color="primary"
                      variant="flat"
                      class="rounded-lg"
                    >
                    {{ item.qty }}
                    </VChip>
                  </template>
                </VListItem>
              </VList>
            </VCardText>
          </VCard>
        </div>
      </VSlideGroupItem>
    </VSlideGroup>

    <!-- TAMPILAN KALAU KOSONG -->
    <VCard
      v-else
      class="text-center pa-8"
      variant="tonal"
    >
      <VCardText>
        <VIcon
          size="64"
          color="success"
          icon="mdi-check-circle"
        />
        <p class="text-h5 mt-3">
          Semua order sudah selesai!
        </p>
        <p class="text-body-1 text-medium-emphasis">
          Tidak ada order yang perlu dimasak saat ini.
        </p>
      </VCardText>
    </VCard>
  </div>
</template>

<style scoped>
.cooking-slider {
  padding-block-end: 8px;
}

.slide-item {
  padding-inline-end: 16px;
  inline-size: 320px;
}

.cooking-card {
  min-block-size: 360px;
}

.order-list-wrapper {
  block-size: 100%;
}

.order-list {
  min-block-size: 260px;
}

.item-title {
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: unset !important;
  word-break: break-word;
  line-height: 1.25;
}
</style>
