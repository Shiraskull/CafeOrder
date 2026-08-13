<script setup>
/**
 * Riwayat pesanan selesai — GET /pesanans/history (server pagination).
 */
import { useOrderStore } from '@/plugins/store/orderStore'
import { computed, onMounted, ref, watch } from 'vue'

definePage({
  meta: {
    action: 'read',
    subject: 'AclDemo',
  },
})

const orderStore = useOrderStore()

const searchQuery = ref('')
const page = ref(1)
const perPage = ref(10)
const isDetailOpen = ref(false)
const selectedRow = ref(null)

let searchTimer = null

const perPageOptions = [
  { title: '10 / halaman', value: 10 },
  { title: '20 / halaman', value: 20 },
  { title: '50 / halaman', value: 50 },
]

const meta = computed(() => orderStore.historyMeta)
const rows = computed(() => orderStore.historyOrders)
const loading = computed(() => orderStore.historyLoading)

const loadHistory = async () => {
  await orderStore.fetchHistory({
    page: page.value,
    perPage: perPage.value,
    search: searchQuery.value.trim(),
  }).catch(() => {})
}

onMounted(() => {
  loadHistory()
})

watch(page, () => {
  loadHistory()
})

watch(perPage, () => {
  if (page.value !== 1)
    page.value = 1
  else
    loadHistory()
})

watch(searchQuery, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    if (page.value !== 1)
      page.value = 1
    else
      loadHistory()
  }, 400)
})

const formatRp = n =>
  `Rp ${Number(n || 0).toLocaleString('id-ID')}`

const formatWaktu = value => {
  if (!value)
    return '-'
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime()))
    return '-'

  return d.toLocaleString('id-ID')
}

const rangeLabel = computed(() => {
  const { from, to, total } = meta.value
  if (!total)
    return '0 pesanan'

  return `Menampilkan ${from}–${to} dari ${total}`
})

const headers = [
  { title: 'Waktu', key: 'waktu', sortable: false },
  { title: 'Meja', key: 'tableName', sortable: false },
  { title: 'Order', key: 'id', sortable: false },
  { title: 'Item', key: 'itemSummary', sortable: false },
  { title: 'Total', key: 'total', sortable: false },
  { title: 'Status', key: 'status', sortable: false },
  { title: '', key: 'actions', sortable: false, align: 'end' },
]

const openDetail = row => {
  selectedRow.value = row
  isDetailOpen.value = true
}

const closeDetail = () => {
  isDetailOpen.value = false
  selectedRow.value = null
}

const goPrev = () => {
  if (page.value > 1)
    page.value -= 1
}

const goNext = () => {
  if (page.value < meta.value.last_page)
    page.value += 1
}
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4">
      <div>
        <h4 class="text-h4 mb-1">
          History Order
        </h4>
        <div class="text-body-2 text-medium-emphasis">
          Pesanan yang sudah selesai
        </div>
      </div>
      <VChip
        color="info"
        variant="tonal"
      >
        {{ meta.total }} selesai
      </VChip>
    </div>

    <VCard>
      <VCardText class="d-flex align-center flex-wrap ga-3">
        <VTextField
          v-model="searchQuery"
          placeholder="Cari meja, order, no pesanan..."
          density="compact"
          hide-details
          prepend-inner-icon="tabler-search"
          style="max-inline-size: 320px; min-inline-size: 220px;"
        />
        <VSelect
          v-model="perPage"
          :items="perPageOptions"
          density="compact"
          hide-details
          style="max-inline-size: 160px;"
        />
        <VSpacer />
        <VBtn
          variant="tonal"
          color="primary"
          prepend-icon="tabler-refresh"
          :loading="loading"
          @click="loadHistory"
        >
          Refresh
        </VBtn>
      </VCardText>

      <VDataTable
        :headers="headers"
        :items="rows"
        :loading="loading"
        :items-per-page="-1"
        hide-default-footer
        class="text-no-wrap"
        hover
        @click:row="(_e, row) => openDetail(row.item?.raw ?? row.item)"
      >
        <template #item.waktu="{ item }">
          <div class="text-body-2">
            {{ formatWaktu(item.waktu) }}
          </div>
        </template>

        <template #item.tableName="{ item }">
          <span class="font-weight-medium">{{ item.tableName }}</span>
        </template>

        <template #item.id="{ item }">
          <div>
            <div class="font-weight-medium">
              #{{ item.id }}
            </div>
            <div
              v-if="item.noPesanan && item.noPesanan !== '-'"
              class="text-caption text-medium-emphasis"
            >
              {{ item.noPesanan }}
            </div>
          </div>
        </template>

        <template #item.itemSummary="{ item }">
          <div
            class="text-body-2 text-truncate"
            style="max-inline-size: 280px;"
            :title="item.itemSummary"
          >
            {{ item.itemSummary }}
          </div>
          <div class="text-caption text-medium-emphasis">
            {{ item.itemCount }} item
          </div>
        </template>

        <template #item.total="{ item }">
          <span class="font-weight-medium">{{ formatRp(item.total) }}</span>
        </template>

        <template #item.status>
          <VChip
            size="small"
            color="info"
            variant="tonal"
          >
            Selesai
          </VChip>
        </template>

        <template #item.actions="{ item }">
          <VBtn
            icon
            size="small"
            variant="text"
            @click.stop="openDetail(item)"
          >
            <VIcon icon="tabler-eye" />
          </VBtn>
        </template>

        <template #no-data>
          <div class="text-center py-10 text-medium-emphasis">
            Belum ada riwayat pesanan selesai.
          </div>
        </template>

        <template #bottom />
      </VDataTable>

      <!-- Custom pagination (server-side) -->
      <VCardText class="d-flex align-center flex-wrap ga-3 pt-0">
        <div class="text-body-2 text-medium-emphasis">
          {{ rangeLabel }}
        </div>
        <VSpacer />
        <div class="d-flex align-center ga-2">
          <VBtn
            icon
            size="small"
            variant="tonal"
            :disabled="page <= 1 || loading"
            @click="goPrev"
          >
            <VIcon icon="tabler-chevron-left" />
          </VBtn>
          <VPagination
            v-model="page"
            :length="meta.last_page || 1"
            :total-visible="5"
            density="compact"
            active-color="primary"
            :disabled="loading"
          />
          <VBtn
            icon
            size="small"
            variant="tonal"
            :disabled="page >= meta.last_page || loading"
            @click="goNext"
          >
            <VIcon icon="tabler-chevron-right" />
          </VBtn>
        </div>
      </VCardText>
    </VCard>

    <VDialog
      v-model="isDetailOpen"
      max-width="560"
    >
      <VCard v-if="selectedRow">
        <VCardItem>
          <VCardTitle>
            Detail Order #{{ selectedRow.id }}
          </VCardTitle>
          <VCardSubtitle>
            {{ selectedRow.tableName }}
            <span v-if="selectedRow.noPesanan && selectedRow.noPesanan !== '-'">
              · {{ selectedRow.noPesanan }}
            </span>
          </VCardSubtitle>
        </VCardItem>

        <VDivider />

        <VCardText>
          <div class="d-flex justify-space-between mb-2">
            <span class="text-medium-emphasis">Waktu</span>
            <span>{{ formatWaktu(selectedRow.waktu) }}</span>
          </div>
          <div class="d-flex justify-space-between mb-4">
            <span class="text-medium-emphasis">Status</span>
            <VChip
              size="small"
              color="info"
              variant="tonal"
            >
              Selesai
            </VChip>
          </div>

          <div class="text-subtitle-2 mb-2">
            Item
          </div>
          <VList
            density="compact"
            lines="two"
          >
            <VListItem
              v-for="(item, index) in selectedRow.items"
              :key="`${selectedRow.id}-${index}`"
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
                {{ formatRp(item.price) }}
                <span v-if="item.note || item.catatan">
                  · {{ item.note || item.catatan }}
                </span>
              </VListItemSubtitle>
              <template #append>
                <span class="text-body-2">
                  {{ formatRp(Number(item.qty || 0) * Number(item.price || 0)) }}
                </span>
              </template>
            </VListItem>
          </VList>
        </VCardText>

        <VDivider />

        <VCardText class="d-flex align-center justify-space-between">
          <strong>Total</strong>
          <strong>{{ formatRp(selectedRow.total) }}</strong>
        </VCardText>

        <VCardActions>
          <VSpacer />
          <VBtn
            variant="text"
            @click="closeDetail"
          >
            Tutup
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
