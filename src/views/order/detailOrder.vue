<script setup>
const props = defineProps({
  cart: {
    type: Array,
    default: () => [],
  },
  table: {
    type: Array,
    default: () => [],
  },
  discountPercent: {
    type: Number,
    default: 0,
  },
  statusOrder: {
    type: Number,
    default: 0,
  },
    step: {
    type: Number,
    default: 0,
  },
  selectTable:{
    type: [String, Number],
    default:null
  },
   orderSummary: {
    type: Object,
    required: true,
    default: () => ({
      subtotal: 0,
      tax: 0,
      total: 0
    })
  }
})

function isMejaKosong(t) {
  if (!t)
    return false
  return String(t.status || '').toLowerCase() === 'available'
}

/**
 * TEST / odang: `false` = dropdown isi semua meja (terisi juga bisa dipilih).
 * Produksi: `true` = hanya meja kosong (`available`).
 */
const HANYA_MEJA_KOSONG = false

/** Item VSelect — semua meja atau hanya kosong, sesuai flag di atas. */
const mejaSelectItems = computed(() => {
  const list = HANYA_MEJA_KOSONG
    ? props.table.filter(isMejaKosong)
    : props.table
  return list.map(t => ({
    title: `Meja ${t.number}`,
    value: t.idMeja ?? t.id,
  }))
})

const emit = defineEmits([
  'update:discountPercent',
  'remove-item',
  'update-qty',
  'status-table',
  'cancel',
  'back',
  'pay',
])

const statusItems = [
  { value: 1, title: 'Dine In' },
  { value: 0, title: 'Take Away' }
]


const selectedStatus=ref(props.statusOrder)
watch(() => props.statusOrder, (newVal) => {
  selectedStatus.value = newVal
})
const taxRate = ref(11);
const selectedTable = ref(props.selectTable)

    
// Watch kalau props berubah
watch(() => props.selectTable, (newVal) => {
  selectedTable.value = newVal
})

watch(mejaSelectItems, list => {
  const sel = selectedTable.value
  if (sel == null || sel === '')
    return
  const stillOk = list.some(t => String(t.value) === String(sel))
  if (!stillOk) {
    selectedTable.value = null
    emit('status-table', null, 'table')
  }
})




const subTotal = computed(() =>
  props.cart.reduce((sum, c) => sum + c.price * c.qty, 0),
)
const discountAmount = computed(() =>
  Math.round(subTotal.value * (props.discountPercent / 100)),
)
const afterDiscount = computed(() => subTotal.value - discountAmount.value)
// const taxAmount = computed(() => Math.round(afterDiscount.value * taxRate))
// const total = computed(() => afterDiscount.value + taxAmount.value)
const taxAmount = computed(() => Math.round(subTotal.value * (taxRate.value /100)))
const total = computed(() => subTotal.value + taxAmount.value)

const formatRp = n => `Rp ${new Intl.NumberFormat('id-ID').format(n)}`

const removeFromCart = item => emit('remove-item', item)
const updateQty = (item, delta) => emit('update-qty', item, delta)
const handleStatusChange = (value)=> emit('status-table', value, 'status')
const handleTableChange = (value)=> emit('status-table', value, 'table')
</script>

<template>
  <div class="detail-order">
    <h5 class="text-h5 font-weight-bold mb-4">
      Checkout
    </h5>

    <div class="detail-order-table-wrapper">
      <div class="detail-order-header">
        <span>Name</span>
        <span>QTY</span>
        <span>Price</span>
      </div>
      <div class="detail-order-table-scroll">
        <div
          v-for="item in cart"
          :key="item.id"
          class="detail-order-row"
        >
        <div class="detail-order-name-cell d-flex align-start gap-2">
          <IconBtn
            size="small"
            color="error"
            variant="text"
            class="flex-shrink-0 mt-0"
            @click="removeFromCart(item)"
          >
            <VIcon icon="tabler-trash" size="18" />
          </IconBtn>
          <span class="text-body-2 detail-order-item-name">{{ item.name }}</span>
        </div>
        <div class="detail-order-qty-cell d-flex align-center justify-center gap-1">
          <VBtn
            icon
            size="x-small"
            variant="tonal"
            @click="updateQty(item, -1)"
          >
            <VIcon icon="tabler-minus" size="14" />
          </VBtn>
          <span class="detail-order-qty">{{ item.qty }}</span>
          <VBtn
            icon
            size="x-small"
            variant="tonal"
            @click="updateQty(item, 1)"
          >
            <VIcon icon="tabler-plus" size="14" />
          </VBtn>
        </div>
        <span class="text-body-2 font-weight-medium detail-order-price-cell">
          {{ formatRp(item.price * item.qty) }}
        </span>
        </div>
        <div v-if="!cart.length" class="detail-order-empty text-medium-emphasis py-6">
          Keranjang kosong. Pilih item di kiri.
        </div>
      </div>
    </div>

    <VDivider class="my-3" />

    <div class="detail-order-summary">
      <div class="d-flex align-center justify-space-between mb-2">
        <span>Status</span>
         <div style="width: auto; min-width: 100px;">
          <VSelect
            v-model="selectedStatus"
            :items="statusItems"
            :item-title="item =>item.title"
            :item-value="item => item.value"
            variant="underlined"
              @update:model-value="handleStatusChange"
            placeholder="Pilih Status"
          />
        </div>
      </div>
      <div class="d-flex align-center justify-space-between mb-2" v-if="props.statusOrder === 1">
        <span>Meja</span>
        <!-- <span>{{ props.statusTable}}</span> -->
         <div style="width: auto; min-width: 100px;">
           <VSelect
             v-model="selectedTable"
             :items="mejaSelectItems"
             item-title="title"
             item-value="value"
             variant="underlined"
             @update:model-value="handleTableChange"
             placeholder="Pilih Meja"
           />
         </div>
      </div>
      <div class="d-flex justify-space-between mb-1">
        <span>Sub Total</span>
        <span>{{ formatRp(orderSummary.subtotal) }}</span>
      </div>
      <div class="d-flex justify-space-between mb-1 text-medium-emphasis">
        <span>Tax {{ orderSummary.taxrate }}%</span>
        <span>{{ formatRp(orderSummary.tax) }}</span>
      </div>
      <div class="d-flex justify-space-between mt-2 pt-2 detail-order-total">
        <span class="font-weight-bold">Total</span>
        <span class="text-h6 font-weight-bold text-success">
          {{ formatRp(orderSummary.total) }}
        </span>
      </div>
    </div>

    <div class="detail-order-actions mt-4">
      <!-- <VBtn
        color="error"
        variant="tonal"
        class="flex-grow-1"
        @click="emit('cancel')"
      >
        Cancel Order
      </VBtn>
      <VBtn
        color="success"
        variant="tonal"
        class="flex-grow-1"
        @click="emit('hold')"
      >
        Hold Order
      </VBtn> -->
      <VBtn
        color="error"
        class="flex-grow-1"
        :disabled="props.step == 0"
        @click="emit('back')"
      >
        back
      </VBtn>
      <VBtn
        color="success"
        class="flex-grow-1"
        :disabled="!cart.length"
        @click="emit('pay')"
      >
        Lanjut
      </VBtn>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.detail-order {
  display: flex;
  flex-direction: column;
  flex: 1 1 0;
  min-block-size: 0;
  background: #fff;
  border-radius: 8px;
  padding: 1.25rem;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  max-inline-size: 100%;
}

.detail-order-table-wrapper {
  flex: 1 1 0;
  min-block-size: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.detail-order-table-scroll {
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
  min-block-size: 80px;
}

.detail-order-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 100px 100px;
  gap: 0.5rem;
  padding-block-end: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.detail-order-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 100px 100px;
  gap: 0.5rem;
  align-items: start;
  padding-block: 0.5rem;
  border-block-end: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));

  &:last-child {
    border-block-end: none;
  }
}

.detail-order-name-cell {
  min-inline-size: 0;
}

.detail-order-item-name {
  overflow-wrap: break-word;
  word-break: break-word;
}

.detail-order-qty-cell,
.detail-order-price-cell {
  align-self: center;
}

.detail-order-qty {
  min-inline-size: 1.5rem;
  text-align: center;
  font-weight: 500;
}

.detail-order-empty {
  text-align: center;
  font-size: 0.875rem;
}

.detail-order-discount-input {
  :deep(.v-field__input) {
    text-align: end;
  }
}

.detail-order-summary {
  font-size: 0.875rem;
}

.detail-order-total {
  border-block-start: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  font-size: 1rem;
}

.detail-order-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

@media (min-width: 960px) {
  .detail-order-actions {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .detail-order-actions .v-btn {
    min-inline-size: 0;
  }
}
</style>
