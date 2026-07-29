<script setup>
/**
 * Daftar meja dari GET table-orders (tableOrdersStore).
 * Terisi / kosong dari cashierOrders: cocokkan id_meja, atau table_name (dinormalisasi), atau nomor meja dari label ("Meja 1" ↔ nomor 1 / "Table 1").
 */
import TableCrudDialog from '@/components/order/TableCrudDialog.vue'
import TableLayoutGrid from '@/views/order/TableLayoutGrid.vue'
import { useOrderStore } from '@/plugins/store/orderStore'
import { useTableOrdersStore } from '@/plugins/store/tableOrdersStore'
import { buildTableRowsFromStores } from '@/utils/tableOrdersLayout'
import { computed, onMounted, ref } from 'vue'

definePage({
  meta: {
    action: 'read',
    subject: 'AclDemo',
  },
})

const orderStore = useOrderStore()
const tableOrdersStore = useTableOrdersStore()

const crudDialogOpen = ref(false)
const crudMode = ref('create')
const crudLoading = ref(false)
const crudInitial = ref(null)
const editTargetRaw = ref(null)

const deleteDialogOpen = ref(false)
const deleteTarget = ref(null)
const deleteLoading = ref(false)

const snackbarShow = ref(false)
const snackbarText = ref('')

function showError(msg) {
  snackbarText.value = String(msg || 'Terjadi kesalahan')
  snackbarShow.value = true
}

function openCreateTable() {
  crudMode.value = 'create'
  crudInitial.value = null
  editTargetRaw.value = null
  crudDialogOpen.value = true
}

function openEditTable(table) {
  crudMode.value = 'edit'
  editTargetRaw.value = table.raw
  crudInitial.value = {
    tableName: table.tableName,
  }
  crudDialogOpen.value = true
}

async function onCrudSubmit(payload) {
  if (!payload.table_name) {
    showError('Isi nama meja')
    return
  }
  crudLoading.value = true
  try {
    if (crudMode.value === 'create')
      await tableOrdersStore.createTable(payload)
    else if (editTargetRaw.value)
      await tableOrdersStore.updateTable(editTargetRaw.value, payload)
    else {
      showError('Data meja tidak valid')
      return
    }
    crudDialogOpen.value = false
    await orderStore.fetchOrder().catch(() => {})
  }
  catch (e) {
    showError(tableOrdersStore.error || e?.message)
  }
  finally {
    crudLoading.value = false
  }
}

function openDeleteTable(table) {
  deleteTarget.value = table
  deleteDialogOpen.value = true
}

async function confirmDeleteTable() {
  const raw = deleteTarget.value?.raw
  if (!raw)
    return
  deleteLoading.value = true
  try {
    await tableOrdersStore.deleteTable(raw)
    deleteDialogOpen.value = false
    deleteTarget.value = null
    await orderStore.fetchOrder().catch(() => {})
  }
  catch (e) {
    showError(tableOrdersStore.error || e?.message)
  }
  finally {
    deleteLoading.value = false
  }
}

onMounted(() => {
  orderStore.fetchOrder().catch(() => {})
  tableOrdersStore.fetchTablesOrders().catch(() => {})
})

const tables = computed(() =>
  buildTableRowsFromStores(tableOrdersStore.items, orderStore.cashierOrders, 'layout'),
)

const summary = computed(() => {
  const total = tables.value.length
  const terisi = tables.value.filter(item => item.status === 'terisi').length
  const kosong = total - terisi

  return { total, terisi, kosong }
})
</script>

<template>
  <div>
    <div class="d-flex flex-wrap align-center justify-space-between mb-4 gap-3">
      <div>
        <h4 class="text-h4 mb-1">
          Layout Meja / Bangku
        </h4>
        <p class="text-body-2 mb-0">
          Daftar meja dari server; terisi / kosong mengikuti pesanan (id meja atau nama / nomor meja)
        </p>
      </div>
      <VBtn
        color="primary"
        prepend-icon="tabler-plus"
        @click="openCreateTable"
      >
        Tambah meja
      </VBtn>
    </div>

    <VRow class="mb-2">
      <VCol
        cols="12"
        md="4"
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
        cols="12"
        md="4"
      >
        <VCard class="summary-card summary-card--terisi">
          <VCardText class="py-4">
            <div class="text-caption mb-1">
              Terisi
            </div>
            <div class="text-h5 font-weight-bold">
              {{ summary.terisi }}
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        md="4"
      >
        <VCard class="summary-card summary-card--kosong">
          <VCardText class="py-4">
            <div class="text-caption mb-1">
              Kosong
            </div>
            <div class="text-h5 font-weight-bold">
              {{ summary.kosong }}
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <TableLayoutGrid
      :tables="tables"
      show-actions
      @edit-table="openEditTable"
      @delete-table="openDeleteTable"
    />

    <TableCrudDialog
      v-model="crudDialogOpen"
      :mode="crudMode"
      :initial="crudInitial"
      :loading="crudLoading"
      @submit="onCrudSubmit"
    />

    <VDialog
      v-model="deleteDialogOpen"
      max-width="420"
    >
      <VCard>
        <VCardTitle>Hapus meja?</VCardTitle>
        <VCardText class="text-body-2">
          Meja <strong>{{ deleteTarget?.tableName || ('#' + deleteTarget?.number) }}</strong> akan dihapus permanen.
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            variant="text"
            @click="deleteDialogOpen = false"
          >
            Batal
          </VBtn>
          <VBtn
            color="error"
            :loading="deleteLoading"
            @click="confirmDeleteTable"
          >
            Hapus
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <VSnackbar
      v-model="snackbarShow"
      color="error"
      location="top"
      :timeout="4000"
    >
      {{ snackbarText }}
    </VSnackbar>
  </div>
</template>

<style scoped>
.summary-card {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 12px;
  color: #1f2937;
}

.summary-card--total {
  background: linear-gradient(135deg, #ede9fe, #ddd6fe);
}

.summary-card--terisi {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
}

.summary-card--kosong {
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
}
</style>
