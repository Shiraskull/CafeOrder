<script setup>
import TableCard from '@/components/orders/TableCard.vue'
import TableOrderDialog from '@/components/orders/TableOrderDialog.vue'
import { useOrderStore } from '@/plugins/store/orderStore'

definePage({
  meta: {
    action: 'read',
    subject: 'AclDemo',
  },
})

const order = useOrderStore()

onMounted(async () => {
  await order.fetchOrder()
  console.log('Data setelah fetch:', order.cashierOrders)
})

const parseTableNumber = meja => {
  const matched = String(meja || '').match(/\d+/)
  return matched ? Number(matched[0]) : 0
}

const tables = computed(() => {
  const groupedByTable = new Map()

  order.cashierOrders.forEach(orderItem => {
    console.log(orderItem);
    
    if (!groupedByTable.has(orderItem.meja)) {
      groupedByTable.set(orderItem.meja, {
        id: orderItem.meja,
        status:orderItem.status,
        number: parseTableNumber(orderItem.meja),
        orders: [],
      })
    }

    const table = groupedByTable.get(orderItem.meja)
    table.orders.push(
      ...orderItem.items.map((item, index) => ({
        id: `${orderItem.id}-${index}`,
        name: item.name,
        qty: item.qty,
        price: Number(item.price || 0),
        note: item.note || item.catatan || '',
      })),
    )
  })

  return Array.from(groupedByTable.values())
    .map(table => ({
      ...table,
      total: table.orders.reduce((sum, item) => sum + item.qty * item.price, 0),
    }))
    // .sort((a, b) => a.number - b.number)
})
console.log(tables.value);

const isOrderDialogOpen = ref(false)
const selectedTable = ref(null)

const openTableDetail = table => {
  selectedTable.value = table
  isOrderDialogOpen.value = true
}
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4">
      <h4 class="text-h4">
        Order Meja
      </h4>
      <VChip
        color="primary"
        variant="tonal"
      >
        Data Pinia
      </VChip>
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
