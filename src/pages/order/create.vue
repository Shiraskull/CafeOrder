<script setup>
/**
 * Buat order POS: butuh produk/kategori + daftar meja yang sinkron dengan API (orderStore).
 */
import ConfirmDialog from '@/components/dialogs/ConfirmDialog.vue'
import InfoDialog from '@/components/dialogs/InfoDialog.vue'
import { useCategoryStore } from '@/plugins/store/categoryStore'
import { useOrderStore } from '@/plugins/store/orderStore'
import { useProductStore } from '@/plugins/store/products'
import { useTableOrdersStore } from '@/plugins/store/tableOrdersStore'
import { buildTableRowsFromStores } from '@/utils/tableOrdersLayout'
import CartOrder from '@/views/order/CartOrder.vue'
import DetailOrder from '@/views/order/detailOrder.vue'
import PaymentMethodForm from '@/views/order/PaymentMethodForm.vue'
import TableOrder from '@/views/order/tableOrder.vue'
import { onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

definePage({
  meta: {
    action: 'read',
    subject: 'AclDemo',
    layoutWrapperClasses: 'layout-content-height-fixed',
  },
})

const router = useRouter()


const discountPercent = ref(20)
const step=ref(0)
const orderStore = useOrderStore()
const categoryStore = useCategoryStore()
const productStore = useProductStore()
const tableOrdersStore = useTableOrdersStore()
const selectedTable = ref(null);
const typeOrder=ref(null)

const cart = ref([])
const taxRate = ref(11);
const money = ref(null)

const confirmDialog=ref('')
const isDialog=ref(false)
const isDialogPayment=ref(false)
const submittingOrder = ref(false)

/** ID cafe untuk payload POST /pesanans/post — sesuaikan dengan backend. */
const NO_CAFE_ID = 1

const paymentMethod = ref('cash')

watch(selectedTable, newdata => {
  if (newdata !== null)
    typeOrder.value = 1
  else
    typeOrder.value = 0
})

const subTotal = computed(() =>
  cart.value.reduce((sum, c) => sum + c.price * c.qty, 0),
)
const discountAmount = computed(() =>
  Math.round(subTotal.value * (discountPercent.value / 100)),
)
const afterDiscount = computed(() => subTotal.value - discountAmount.value)
// const taxAmount = computed(() => Math.round(afterDiscount.value * taxRate))
// const total = computed(() => afterDiscount.value + taxAmount.value)
const taxAmount = computed(() => Math.round(subTotal.value * (taxRate.value /100)))
const total = computed(() => subTotal.value + taxAmount.value)

const orderSummary = computed(() => ({
  subtotal: subTotal.value,
  taxrate:taxRate.value,
  tax: taxAmount.value,
  total: total.value
}))

const selectedTableRow = computed(() => {
  if (selectedTable.value == null || selectedTable.value === '')
    return null
  return tables.value.find(t => String(t.idMeja ?? t.id) === String(selectedTable.value)) ?? null
})

function buildPesananPayload() {
  const idTable = selectedTable.value != null ? Number(selectedTable.value) : 0
  console.log(selectedTable.value);
  
  const nomorMeja = Number(selectedTableRow.value?.number) || 0
  const details = cart.value.map(c => ({
    product: Number(c.id),
    jumlah: Number(c.qty) || 0,
    note: String(c.note ?? c.catatan ?? '').trim(),
  }))
  const labelMeja =
    typeOrder.value === 1 && nomorMeja
      ? `Meja ${nomorMeja}`
      : 'Takeaway'
  /** Cash: total order (tunai). QRIS: 0 — tidak pakai field tunai. */
  const amountPaid = Math.round(Number(total.value) || 0)
  const cashValue = paymentMethod.value === 'qris' ? 0 : amountPaid
  return {
    noMeja: idTable,
    noCafe: NO_CAFE_ID,
    nama_order: `${labelMeja} - Customer A`,
    method: paymentMethod.value,
    cash: cashValue,
    details,
  }
}

watch(isDialogPayment, open => {
  if (open)
    console.log(JSON.stringify(buildPesananPayload(), null, 2))
})

/**
 * Daftar meja dari GET table-orders + terisi/kosong dari cashierOrders (sama seperti table-layout).
 */
const tables = computed(() =>
  buildTableRowsFromStores(tableOrdersStore.items, orderStore.cashierOrders, 'pos'),
)

/** Produk dari GET /products (productStore). */
const displayMenuItems = computed(() => productStore.products)

/** Tab kategori: tampilkan nama (dari produk.category_name / categoryStore). */
const cartCategories = computed(() => {
  const nameById = new Map()

  for (const p of productStore.products) {
    if (p.category == null)
      continue
    if (p.categoryName)
      nameById.set(String(p.category), p.categoryName)
  }

  const nav = categoryStore.categoryNavItems
  if (nav.length) {
    return nav.map(c => {
      const id = String(c.id)
      const fromProduct = nameById.get(id)
      const label = fromProduct
        || (c.label && !/^\d+$/.test(String(c.label)) ? c.label : null)
        || `Kategori ${id}`

      return {
        id,
        label,
        icon: c.icon || 'tabler-category',
      }
    })
  }

  if (!productStore.products.length)
    return null

  const seen = new Set()
  const out = []
  for (const p of productStore.products) {
    if (p.category == null || seen.has(String(p.category)))
      continue
    const id = String(p.category)
    seen.add(id)
    out.push({
      id,
      label: nameById.get(id) || p.categoryName || `Kategori ${id}`,
      icon: 'tabler-category',
    })
  }

  return out.length ? out : null
})

const addToCart = item => {
  const existing = cart.value.find(c => c.id === item.id)
  if (existing) existing.qty += 1
  else cart.value.push({ ...item, qty: 1 })
}

const removeFromCart = item => {
  cart.value = cart.value.filter(c => c.id !== item.id)
}

const updateQty = (item, delta) => {
  const entry = cart.value.find(c => c.id === item.id)
  if (!entry) return
  entry.qty = Math.max(0, entry.qty + delta)
  if (entry.qty === 0) removeFromCart(item)
}

const cancelOrder = () => {
  cart.value = []
}

const holdOrder = () => {
  // TODO: simpan ke draft / hold
  cart.value = []
}

const onPay = () => {

  if (step.value == 1 && typeOrder.value === 1 && selectedTable.value === null) {
    confirmDialog.value='Meja belum dipilih'
    isDialog.value=true
  }else if(typeOrder.value === null ){
    typeOrder.value = 0
    step.value +=1
  }else if(step.value === 2 ){
    checkPayment()
    // confirmDialog.value='Yakin membuat order?'
    // isDialogPayment.value=true
  }
  else{
    step.value +=1
  }
// console.log(total.value,taxAmount.value,subTotal.value);

}

const checkPayment = () => {
  if (paymentMethod.value === 'qris') {
    confirmDialog.value = 'Yakin membuat order?'
    isDialogPayment.value = true
    return
  }
  const tunai = Number(money.value) || 0
  if (tunai >= total.value) {
    confirmDialog.value = 'Yakin membuat order?'
    isDialogPayment.value = true
  }
  else {
    confirmDialog.value = 'Uang tidak cukup'
    isDialog.value = true
  }
}

const backStep = () =>{
  step.value -=1
}

function isTableSelectable(t) {
  return t && t.status === 'available'
}

/**
 * TEST / odang: `false` = meja terisi tetap bisa dipilih + tidak ada modal blokir.
 * Produksi: set ke `true` — blokir meja non-available + InfoDialog "Meja telah terisi".
 */
const BLOKIR_MEJA_TERISI = false

const onTable = table => {
  console.log('[order/create] meja dipilih dari kartu:', {
    number: table?.number,
    idMeja: table?.idMeja,
    id: table?.id,
    status: table?.status,
    raw: table?.raw,
  })
  if (BLOKIR_MEJA_TERISI && !isTableSelectable(table)) {
    confirmDialog.value = 'Meja telah terisi'
    isDialog.value = true
    return
  }
  selectedTable.value = table.idMeja ?? table.id
}

const updateStatus = (item, type) => {
  if (type === 'status') {
    typeOrder.value = item
    selectedTable.value = null
  }
  else {
    if (item == null || item === '') {
      selectedTable.value = null
      return
    }
    const row = tables.value.find(t => String(t.idMeja ?? t.id) === String(item))
    console.log('[order/create] meja dipilih dari dropdown:', {
      selectedValue: item,
      number: row?.number,
      idMeja: row?.idMeja,
      id: row?.id,
      status: row?.status,
      raw: row?.raw,
    })
    if (BLOKIR_MEJA_TERISI && row && !isTableSelectable(row)) {
      confirmDialog.value = 'Meja telah terisi'
      isDialog.value = true
      return
    }
    selectedTable.value = item
  }
}

const closeModal=()=>{
  isDialog.value=false
}

function onPaymentDialogVisible(visible) {
  isDialogPayment.value = visible
}

async function onConfirmOrder(ok) {
  if (!ok || submittingOrder.value)
    return
  submittingOrder.value = true
  try {
    const payload = buildPesananPayload()
    console.log('POST /pesanans/post payload:', JSON.stringify(payload, null, 2))

    const res = await orderStore.createPesanan(payload)
    isDialogPayment.value = false
    cart.value = []
    router.push('/order')
  }
  catch (err) {
    const body = err?.response?.data
    console.error('POST /pesanans/post gagal — message:', body?.message ?? err?.message ?? body ?? err)
    console.error('POST /pesanans/post gagal — response body:', body ?? err)
    confirmDialog.value = typeof body === 'string'
      ? body
      : (body?.message ?? err?.message ?? 'Gagal menyimpan pesanan')
    isDialog.value = true
  }
  finally {
    submittingOrder.value = false
  }
}

const moneyInput = (pay)=>{
  money.value=Number(pay)
}

function onPaymentConfirm() {
  console.log(JSON.stringify(buildPesananPayload(), null, 2))
}

/**
 * Parallel fetch: kategori, produk, dan pesanan/meja.
 * fetchOrder memastikan grid meja di langkah pilih meja mencerminkan API (meja terisi).
 */
onMounted(async () => {
  await Promise.all([
    categoryStore.fetchCategoryById(9).catch(() => {}),
    productStore.fetchProducts().catch(() => {}),
    orderStore.fetchOrder().catch(() => {}),
    tableOrdersStore.fetchTablesOrders().catch(() => {}),
  ])
  console.log('[order/create] categoryStore', {
    category: categoryStore.category,
    categoryNavItems: categoryStore.categoryNavItems,
    menuItemsFromCategory: categoryStore.menuItemsFromCategory,
    loading: categoryStore.loading,
    error: categoryStore.error,
    currentId: categoryStore.currentId,
  })
  console.log(
    '[order/create] semua id_table:',
    tableOrdersStore.items.map(table => ({
      id_table: table.id_table,
      table_name: table.table_name,
    })),
  )
})
</script>


<template>
  <InfoDialog
    :messageInfo="confirmDialog"
    :isDialogVisible="isDialog"
    @isDialogVisible =closeModal
  />
    <ConfirmDialog
    :confirmationQuestion="confirmDialog"
    :isDialogVisible="isDialogPayment"
    confirm-title="Berhasil"
    confirm-msg="Pesanan dibuat."
    cancel-title="Batal"
    cancel-msg="Pesanan tidak dibuat."
    @confirm="onConfirmOrder"
    @update:isDialogVisible="onPaymentDialogVisible"
  />
  <div class="order-create-pos">
    <VRow no-gutters class="fill-height">
      <VCol
      cols="12"
      md="8"
      class="pos-left"
      >
        <div
          v-if="step === 0"
          class="pos-cart-wrap d-flex flex-column flex-grow-1"
          style="min-block-size: 0;"
        >
          <div
            v-if="productStore.loading"
            class="d-flex align-center justify-center flex-grow-1"
            style="min-block-size: 200px;"
          >
            <VProgressCircular
              indeterminate
              color="primary"
              size="48"
            />
          </div>
          <VAlert
            v-else-if="productStore.error"
            type="error"
            variant="tonal"
            class="ma-4"
          >
            {{ productStore.error }}
          </VAlert>
          <CartOrder
            v-else-if="displayMenuItems.length || cartCategories?.length"
            :menu-items="displayMenuItems"
            :categories="cartCategories"
            @add-to-cart="addToCart"
          />
          <VAlert
            v-else
            type="info"
            variant="tonal"
            class="ma-4"
          >
            Belum ada produk. Pastikan API mengembalikan daftar produk.
          </VAlert>
        </div>
        <div
          v-if="step === 1"
          class="d-flex flex-column flex-grow-1"
          style="min-block-size: 0;"
        >
          <div
            v-if="tableOrdersStore.loading"
            class="d-flex align-center justify-center flex-grow-1"
            style="min-block-size: 200px;"
          >
            <VProgressCircular
              indeterminate
              color="primary"
              size="48"
            />
          </div>
          <VAlert
            v-else-if="!tables.length"
            type="info"
            variant="tonal"
            class="ma-4"
          >
            Belum ada meja dari server. Tambah meja di layout atau periksa API table-orders.
          </VAlert>
          <TableOrder
            v-else
            :tables="tables"
            @order-table="onTable"
          />
        </div>
        <PaymentMethodForm
        v-if="step === 2"
        :total="total"
        :show-cancel="false"
        selection-only
        @input-money="moneyInput"
        @payment-method-change="paymentMethod = $event"
        @confirm="onPaymentConfirm"
      />
      </VCol>

      <VCol
        cols="12"
        md="4"
        class="pos-right"
      >
        <DetailOrder
          v-model:discount-percent="discountPercent"
          :cart="cart"
          :order-summary="orderSummary"
          :step="step"
          :statusOrder="typeOrder"
          :table="tables"
          :selectTable="selectedTable"
          @status-table="updateStatus"
          @remove-item="removeFromCart"
          @update-qty="updateQty"
          @back="backStep"
          @pay="onPay"
        />
      </VCol>
    </VRow>
  </div>
</template>

<style lang="scss" scoped>
.order-create-pos {
  block-size: calc(100vh - 9rem);
  min-block-size: calc(100vh - 9rem);
  background: rgb(var(--v-theme-surface));
}

.pos-left {
  border-inline-end: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: #fff;
  display: flex;
  flex-direction: column;
  min-block-size: 0;
  overflow: hidden;
  padding-inline-end: 1rem;
}

.pos-right {
  background: #f8fafc;
  padding: 1rem;
  padding-inline-start: 1.25rem;
  display: flex;
  flex-direction: column;
  min-block-size: 0;
  overflow: hidden;
}
</style>
