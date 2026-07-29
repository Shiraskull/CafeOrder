<script setup>
import { computed } from 'vue'

const props = defineProps({
  table: {
    type: Object,
    required: true,
  },
  /** Kartu terpilih (mode kelola / tablet). */
  selected: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['click'])

const statusLabel = status => {
  if (status === 'terisi' || status === 'occupied')
    return 'Terisi'
  if (status === 'kosong' || status === 'available')
    return 'Kosong'
  if (status === 'reserved')
    return 'Reserved'
  if (status === 'booked')
    return 'Dipesan'

  return 'Kosong'
}

const statusPalette = {
  kosong: {
    seat: ['#dcfce7', '#d1fae5', '#ecfccb'],
    accent: ['#9fe870', '#84cc16', '#65a30d'],
  },
  available: {
    seat: ['#dcfce7', '#d1fae5', '#ecfccb'],
    accent: ['#9fe870', '#84cc16', '#65a30d'],
  },
  terisi: {
    seat: ['#e5e7eb', '#e2e8f0', '#d1d5db'],
    accent: ['#9ca3af', '#94a3b8', '#6b7280'],
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
  const palette = statusPalette[table.status] || statusPalette.kosong
  const idx = (table.number - 1) % palette.seat.length

  return {
    '--table-seat-bg': palette.seat[idx],
    '--table-accent': palette.accent[idx],
  }
}

const onClick = () => {
  emit('click', props.table)
}

/**
 * Produksi: `props.table.status === 'available'` — meja terisi tampak disabled.
 * TEST / odang: `true` — semua kartu bisa diklik.
 */
const isSelectable = computed(() => true)
// const isSelectable = computed(() => props.table.status === 'available')
</script>

<template>
  <div
    class="table-card-tile"
    :class="[
      `table-card-tile--${table.status}`,
      { 'table-card-tile--selected': selected },
    ]"
    :style="getTableToneStyle(table)"
  >
    <span class="table-card-seat table-card-seat--top-left" />
    <span class="table-card-seat table-card-seat--top-right" />
    <span class="table-card-seat table-card-seat--bottom-left" />
    <span class="table-card-seat table-card-seat--bottom-right" />

    <VCard
      class="table-card-seat-card"
      :class="[
        `table-card-seat-card--${table.status}`,
        isSelectable ? 'cursor-pointer' : 'table-card-seat-card--disabled',
      ]"
      :style="getTableToneStyle(table)"
      elevation="2"
      @click="onClick"
    >
      <VCardText class="table-card-content">
        <div class="table-card-number">
          {{ String(table.number).padStart(2, '0') }}
        </div>
        <div class="table-card-status">
          {{ statusLabel(table.status) }}
        </div>
        <div
          v-if="table.time"
          class="table-card-time"
        >
          {{ table.time }}
        </div>
      </VCardText>
    </VCard>
  </div>
</template>

<style scoped>
.table-card-tile {
  position: relative;
  inline-size: 160px;
  block-size: 152px;
}

.table-card-tile--selected .table-card-seat-card {
  outline: 2px solid rgb(var(--v-theme-primary, 99 102 241));
  outline-offset: 1px;
}

.table-card-seat {
  position: absolute;
  z-index: 0;
  border-radius: 999px;
  background: var(--table-seat-bg, #dcfce7);
  block-size: 28px;
  inline-size: 36px;
}

.table-card-seat--top-left {
  inset-block-start: 8px;
  inset-inline-start: 22px;
}

.table-card-seat--top-right {
  inset-block-start: 8px;
  inset-inline-end: 22px;
}

.table-card-seat--bottom-left {
  inset-block-end: 8px;
  inset-inline-start: 22px;
}

.table-card-seat--bottom-right {
  inset-block-end: 8px;
  inset-inline-end: 22px;
}

.table-card-seat-card {
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
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.table-card-seat-card::before {
  position: absolute;
  border-radius: 0 10px 10px 0;
  content: '';
  inset-block: 10px;
  inset-inline-start: 0;
  inline-size: 6px;
  background: var(--table-accent, #9fe870);
}

.table-card-seat-card:hover:not(.table-card-seat-card--disabled) {
  transform: translateY(-2px);
}

.table-card-seat-card--disabled {
  cursor: not-allowed;
  opacity: 0.92;
}

.table-card-content {
  padding: 14px 14px 10px 16px !important;
}

.table-card-number {
  color: #9ca3af;
  font-size: 30px;
  font-weight: 700;
  line-height: 1.1;
}

.table-card-status {
  margin-block-start: 8px;
  color: #6b7280;
  font-size: 16px;
  line-height: 1.1;
}

.table-card-time {
  color: #1f2937;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.1;
  margin-block-start: 4px;
}

.table-card-seat-card--booked,
.table-card-seat-card--occupied,
.table-card-seat-card--terisi {
  background: #eceff1;
}

.table-card-seat-card--booked .table-card-number,
.table-card-seat-card--booked .table-card-status,
.table-card-seat-card--terisi .table-card-number,
.table-card-seat-card--terisi .table-card-status,
.table-card-seat-card--occupied .table-card-number,
.table-card-seat-card--occupied .table-card-status {
  color: #6b7280;
}
</style>
