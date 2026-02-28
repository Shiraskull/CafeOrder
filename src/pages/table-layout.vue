<script setup>
import { useOrderStore } from '@/plugins/store/orderStore'

definePage({
  meta: {
    action: 'read',
    subject: 'AclDemo',
  },
})

const orderStore = useOrderStore()
const totalTables = 20

const normalizeStatus = status => {
  const normalized = String(status || '').toLowerCase()

  if (['reserved', 'reserve'].includes(normalized))
    return 'reserved'
  if (['booked', 'pesan', 'dipesan'].includes(normalized))
    return 'booked'
  if (['occupied', 'busy', 'terisi'].includes(normalized))
    return 'occupied'

  return 'available'
}

const parseTableNumber = meja => {
  const matched = String(meja || '').match(/\d+/)
  return matched ? Number(matched[0]) : 0
}

const tables = computed(() => {
  const statusByTable = new Map()

  orderStore.cashierOrders.forEach(order => {
    const tableNumber = parseTableNumber(order.meja)
    if (!tableNumber)
      return

    if (['order', 'antar'].includes(order.status))
      statusByTable.set(tableNumber, 'occupied')
    else if (!statusByTable.has(tableNumber))
      statusByTable.set(tableNumber, normalizeStatus(order.status))
  })

  return Array.from({ length: totalTables }, (_, index) => {
    const number = index + 1

    return {
      id: number,
      number,
      status: statusByTable.get(number) || 'available',
      time: null,
    }
  })
})

const summary = computed(() => {
  const total = tables.value.length
  const booked = tables.value.filter(item => item.status === 'booked').length
  const occupied = tables.value.filter(item => item.status === 'occupied').length
  const available = total - booked - occupied

  return { total, booked, occupied, available }
})

const statusLabel = status => {
  if (status === 'reserved')
    return 'Reserved'
  if (status === 'booked')
    return 'Booked'
  if (status === 'occupied')
    return 'Occupied'

  return 'Available '
}

const statusPalette = {
  available: {
    seat: ['#dcfce7', '#d1fae5', '#ecfccb'],
    accent: ['#9fe870', '#84cc16', '#65a30d'],
  },
  occupied: {
    seat: ['#e5e7eb', '#e2e8f0', '#d1d5db'],
    accent: ['#9ca3af', '#94a3b8', '#6b7280'],
  },
  booked: {
    seat: ['#fef3c7', '#fde68a', '#fef9c3'],
    accent: ['#fbbf24', '#f59e0b', '#eab308'],
  },
  reserved: {
    seat: ['#fef9c3', '#fef08a', '#fde047'],
    accent: ['#facc15', '#eab308', '#ca8a04'],
  },
}

const getTableToneStyle = table => {
  const palette = statusPalette[table.status] || statusPalette.available
  const idx = (table.number - 1) % palette.seat.length

  return {
    '--table-seat-bg': palette.seat[idx],
    '--table-accent': palette.accent[idx],
  }
}
</script>

<template>
  <div>
    <div class="d-flex flex-wrap align-center justify-space-between mb-4 gap-3">
      <div>
        <h4 class="text-h4 mb-1">
          Layout Meja / Bangku
        </h4>
        <p class="text-body-2 mb-0">
          Status meja tersinkron dari data order Pinia
        </p>
      </div>
    </div>

    <VRow class="mb-2">
      <VCol
        cols="6"
        md="3"
      >
        <VCard class="summary-card summary-card--total">
          <VCardText class="py-4">
            <div class="text-caption mb-1">
              Total Meja
            </div>
            <div class="text-h5 font-weight-bold">
              {{ summary.total }}
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="6"
        md="3"
      >
        <VCard class="summary-card summary-card--booked">
          <VCardText class="py-4">
            <div class="text-caption mb-1">
              Dipesan
            </div>
            <div class="text-h5 font-weight-bold">
              {{ summary.booked }}
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="6"
        md="3"
      >
        <VCard class="summary-card summary-card--occupied">
          <VCardText class="py-4">
            <div class="text-caption mb-1">
              Terisi
            </div>
            <div class="text-h5 font-weight-bold">
              {{ summary.occupied }}
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="6"
        md="3"
      >
        <VCard class="summary-card summary-card--available">
          <VCardText class="py-4">
            <div class="text-caption mb-1">
              Kosong
            </div>
            <div class="text-h5 font-weight-bold">
              {{ summary.available }}
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VRow>
      <VCol
        v-for="table in tables"
        :key="table.id"
        cols="6"
        sm="4"
        md="3"
        lg="2"
        class="d-flex justify-center"
      >
        <div
          class="table-tile"
          :class="`table-tile--${table.status}`"
          :style="getTableToneStyle(table)"
        >
          <span class="table-seat table-seat--top-left" />
          <span class="table-seat table-seat--top-right" />
          <span class="table-seat table-seat--bottom-left" />
          <span class="table-seat table-seat--bottom-right" />

          <VCard
            class="seat-card"
            :class="`seat-card--${table.status}`"
            :style="getTableToneStyle(table)"
            elevation="2"
          >
            <VCardText class="table-content">
              <div class="table-number">
                {{ String(table.number).padStart(2, '0') }}
              </div>
              <div class="table-status">
                {{ statusLabel(table.status) }}
              </div>
              <div
                v-if="table.time"
                class="table-time"
              >
                {{ table.time }}
              </div>
            </VCardText>
          </VCard>
        </div>
      </VCol>
    </VRow>
  </div>
</template>

<style scoped>
.table-tile {
  position: relative;
  inline-size: 160px;
  block-size: 152px;
}

.table-seat {
  position: absolute;
  z-index: 0;
  border-radius: 999px;
  background: var(--table-seat-bg, #dcfce7);
  block-size: 28px;
  inline-size: 36px;
}

.table-seat--top-left {
  inset-block-start: 8px;
  inset-inline-start: 22px;
}

.table-seat--top-right {
  inset-block-start: 8px;
  inset-inline-end: 22px;
}

.table-seat--bottom-left {
  inset-block-end: 8px;
  inset-inline-start: 22px;
}

.table-seat--bottom-right {
  inset-block-end: 8px;
  inset-inline-end: 22px;
}

.seat-card {
  position: absolute;
  z-index: 1;
  inset-block-start: 24px;
  inset-inline-start: 0;
  overflow: hidden;
  border: none;
  border-radius: 12px;
  background: #fff;
  block-size: 104px;
  inline-size: 160px;
  box-shadow:
    0 10px 22px rgba(10, 25, 47, 0.08),
    0 2px 8px rgba(10, 25, 47, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.seat-card::before {
  position: absolute;
  border-radius: 0 10px 10px 0;
  content: '';
  inset-block: 10px;
  inset-inline-start: 0;
  inline-size: 6px;
  background: var(--table-accent, #9fe870);
}

.seat-card:hover {
  transform: translateY(-2px);
}

.table-content {
  padding: 14px 14px 10px 16px !important;
}

.table-number {
  color: #9ca3af;
  font-size: 30px;
  font-weight: 700;
  line-height: 1.1;
}

.table-status {
  margin-block-start: 8px;
  color: #6b7280;
  font-size: 16px;
  line-height: 1.1;
}

.table-time {
  color: #1f2937;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.1;
  margin-block-start: 4px;
}

.seat-card--booked,
.seat-card--occupied {
  background: #eceff1;
}

.seat-card--booked .table-number,
.seat-card--booked .table-status {
  color: #6b7280;
}

/* Keep fallback border in case shadow is disabled by theme */
.seat-card {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.summary-card {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 12px;
  color: #1f2937;
}

.summary-card--total {
  background: linear-gradient(135deg, #ede9fe, #ddd6fe);
}

.summary-card--booked {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
}

.summary-card--occupied {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
}

.summary-card--available {
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
}
</style>
