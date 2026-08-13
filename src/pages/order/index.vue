<script setup>
/**
 * Order Meja (kasir): kartu per meja yang punya pesanan aktif, dari orderStore.cashierOrders.
 */
import TableCard from '@/components/orders/TableCard.vue'
import TableOrderDialog from '@/components/orders/TableOrderDialog.vue'
import { useOrderStore } from '@/plugins/store/orderStore'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

// definePage({
//   meta: {
//     action: 'read',
//     subject: 'AclDemo',
//   },
// })

const order = useOrderStore()
const router = useRouter()

/**
 * Saat halaman dibuka, isi Pinia dari API (satu sumber kebenaran di orderStore).
 * Tanpa ini, cashierOrders kosong walau user sudah login.
 */
onMounted(async () => {
  await order.fetchOrder()
})

/** Ambil angka meja dari string seperti "Meja 5" → 5 (untuk sort / tampilan). */
const parseTableNumber = meja => {
  const matched = String(meja || '').match(/\d+/)
  return matched ? Number(matched[0]) : 0
}

/**
 * Status agregat satu meja untuk kartu: prioritas order → antar → lainnya.
 * Hanya berlaku untuk subset order yang sudah difilter cashierOrders (aktif).
 */
const resolveTableStatus = orders => {
  if (!orders?.length)
    return 'available'
  if (orders.some(o => o.status === 'order'))
    return 'order'
  if (orders.some(o => o.status === 'antar'))
    return 'antar'

  return orders[0]?.status || 'available'
}

/**
 * Data untuk grid TableCard dari cashierOrders (hanya order aktif: order | antar).
 */
const tables = computed(() => {
  return order.cashierOrders
    .map(meja => {
      const orderGroups = (meja.orders || []).map(orderItem => {
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

      const itemLines = (meja.orders || []).flatMap(orderItem =>
        (orderItem.items || []).map((item, index) => ({
          id: `${orderItem.id}-${index}`,
          name: item.name,
          qty: item.qty,
          price: Number(item.price || 0),
          note: item.note || item.catatan || '',
        })),
      )

      return {
        id: meja.nomor,
        status: resolveTableStatus(meja.orders),
        number: parseTableNumber(meja.nomor),
        tableName: meja.tableName || meja.nomor,
        orderGroups,
        orders: itemLines,
        total: itemLines.reduce((sum, item) => sum + item.qty * item.price, 0),
      }
    })
    // .sort((a, b) => a.number - b.number)
})

const isOrderDialogOpen = ref(false)
const selectedTable = ref(null)

const openTableDetail = table => {
  selectedTable.value = table
  isOrderDialogOpen.value = true
}

const toTable=()=>{
  router.push('table-layout')
}
const createOrder=()=>{
  router.push('order/create')
}
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4">
      <h4 class="text-h4">
        Order Meja
      </h4>
      <div class=" d-flex ga-2">
        <VBtn
        @click="toTable"
        color="info"
        >
          List Table
        </VBtn>
        <VBtn
        @click="createOrder"
        color="success"
        >
          Create Order
        </VBtn>
      </div>
    </div>

    <VRow>
      <VCol
        v-for="table in tables"
        :key="table.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <TableCard
          :table="table"
          @click="openTableDetail"
        />
      </VCol>
    </VRow>

    <TableOrderDialog
      v-model="isOrderDialogOpen"
      :table="selectedTable"
    />
  </div>
</template>
