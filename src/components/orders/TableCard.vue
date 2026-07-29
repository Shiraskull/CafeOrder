<script setup>
const props = defineProps({
  table: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['click'])

const totalItems = computed(() => {
  return props.table.orders.reduce((sum, item) => sum + item.qty, 0)
})

const tonePalette = [
  { accent: '#A3E070', hover: 'rgba(163, 224, 112, 1)' },
  { accent: '#7CC8FF', hover: 'rgba(124, 200, 255, 0.2)' },
  { accent: '#FFD56A', hover: 'rgba(255, 213, 106, 0.2)' },
  { accent: '#F8A5C2', hover: 'rgba(248, 165, 194, 0.2)' },
  { accent: '#B39DDB', hover: 'rgba(179, 157, 219, 0.2)' },
  { accent: '#80CBC4', hover: 'rgba(128, 203, 196, 0.2)' },
]

const toneByTable = computed(() => {
  const paletteIndex = (props.table.number - 1) % tonePalette.length

  return tonePalette[paletteIndex]
})

const getStatusColor = (status) => {
  const colors = {
    order: 'warning',
    antar: 'success',
    selesai: 'info',
    batal: 'error',
    pending: 'warning',
    cooking: 'warning',
    ready: 'success',
    completed: 'info',
    cancelled: 'error'
  }
  return colors[status] || 'grey' // default grey kalau status tidak dikenal
}

// Fungsi untuk format teks status (opsional)
const formatStatus = (status) => {
  const labels = {
    order: 'Order',
    antar: 'Di Antar',
    selesai: 'Selesai',
    batal: 'Batal',
    pending: 'Menunggu',
    cooking: 'Dimasak',
    ready: 'Siap',
    completed: 'Completed',
    cancelled: 'Cancelled'
  }
  return labels[status] || status
}
</script>

<template>
  <VCard
    class="h-100 cursor-pointer table-card"
    :style="{
      '--accent-color': toneByTable.accent,
      '--accent-hover': toneByTable.hover,
    }"
    hover
    @click="emit('click', table)"
  >
    <VCardItem class="py-2">
      <VCardTitle class="d-flex align-center justify-space-between">
        <span class="texst-h2 font-weight-bold">{{ table.tableName }}</span>
        <div>
          <VChip
            size="small"
           :color="getStatusColor(table.status)"
            variant="tonal"
            class="font-weight-bold mx-2"
          >
            {{ table.status }}
          </VChip>
          <VChip
            size="small"
            color="primary"
            variant="tonal"
            class="font-weight-bold"
          >
            {{ table.orders.length }} pesanan
          </VChip>
        </div>
      </VCardTitle>
    </VCardItem>

    <VCardText class="py-0 pb-2">
      <div class="text-body-1 font-weight-bold">
        Total item: {{ totalItems }}
      </div>
      <div class="text-body-1 font-weight-bold">
        Total bayar: Rp {{ table.total.toLocaleString('id-ID') }}
      </div>
      <span>......................</span>
    </VCardText>
  </VCard>
</template>

<style scoped>
.table-card {
  position: relative;
  overflow: hidden;
  border: 1px solid #eef2f7;
  border-radius: 12px;
  background-color: #fff;
  transform: translateY(0);
  transition: transform 0.22s ease, background-color 0.2s ease, box-shadow 0.25s ease;
  box-shadow:
    0 10px 18px rgba(191, 219, 254, 0.45),
    0 2px 8px rgba(15, 23, 42, 0.05);
}

.table-card::before {
  position: absolute;
  border-radius: 0 999px 999px 0;
  background: var(--accent-color);
  block-size: 100%;
  content: '';
  inset-block-start: 0;
  inset-inline-start: 0;
  inline-size: 6px;
  transition: inline-size 0.25s ease, background-color 0.25s ease;
}

.table-card::after {
  position: absolute;
  opacity: 0;
  background: linear-gradient(110deg, transparent 20%, rgba(255, 255, 255, 0.45) 50%, transparent 80%);
  content: '';
  inset: 0;
  transform: translateX(-120%);
}

.table-card:hover::before {
  border-radius: 0;
  background: var(--accent-hover);
  inline-size: 100%;
  animation: fillPulse 0.45s ease;
}

.table-card:hover {
  transform: translateY(-3px);
  background-color: var(--accent-hover);
}

.table-card:hover::after {
  opacity: 1;
  animation: hoverSweep 0.55s ease-out;
}

.table-card :deep(.v-card-item),
.table-card :deep(.v-card-text) {
  position: relative;
  z-index: 1;
}

@keyframes hoverSweep {
  from {
    transform: translateX(-120%);
  }
  to {
    transform: translateX(120%);
  }
}

@keyframes fillPulse {
  0% {
    opacity: 0.85;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.95;
  }
}
</style>
