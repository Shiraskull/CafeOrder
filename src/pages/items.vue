<script setup>
import ItemFormDialog from '@/components/items/ItemFormDialog.vue'
import { useCategoryStore } from '@/plugins/store/categoryStore'
import { useProductStore } from '@/plugins/store/products'
import { onMounted } from 'vue'

const categoryStore = useCategoryStore()
const productStore = useProductStore()

const DEFAULT_CATEGORY_ID = 9

function mapStoreProductToRow(p) {
  return {
    id: p.id,
    nama: p.name,
    harga: p.price,
    foto: p.image,
    kategori: p.category,
    diskon: 0,
    id_cafe: '',
  }
}

definePage({
  meta: {
    action: 'read',
    subject: 'AclDemo',
  },
})

const formatRupiah = value => new Intl.NumberFormat('id-ID').format(Number(value) || 0)

const items = ref([])

const isFormDialogOpen = ref(false)
const selectedItem = ref(null)

const openAddModal = () => {
  selectedItem.value = null
  isFormDialogOpen.value = true
}

const openEditModal = item => {
  selectedItem.value = { ...item }
  isFormDialogOpen.value = true
}

const saveItem = payload => {
  if (payload.id) {
    items.value = items.value.map(item => (item.id === payload.id ? payload : item))
    return
  }

  items.value.unshift({
    ...payload,
    id: Date.now(),
  })
}

onMounted(async () => {
  try {
    await productStore.fetchProducts()
    items.value = productStore.productsByCategory(DEFAULT_CATEGORY_ID).map(mapStoreProductToRow)
  } catch {
    /* error tersimpan di productStore.error */
  }
  categoryStore.fetchCategoryById(DEFAULT_CATEGORY_ID).catch(() => {})
})
const deleteItem = id => {
  const isConfirmed = typeof window === 'undefined'
    ? true
    : window.confirm('Yakin ingin menghapus item ini?')

  if (!isConfirmed)
    return

  items.value = items.value.filter(item => item.id !== id)
}
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4">
      <h4 class="text-h4">
        Items
      </h4>
      <VBtn
        color="primary"
        prepend-icon="tabler-plus"
        @click="openAddModal"
      >
        Add Item
      </VBtn>
    </div>

    <VCard>
      <VTable>
        <thead>
          <tr>
            <th>Foto</th>
            <th>Nama</th>
            <th>Harga</th>
            <th>Diskon</th>
            <th>ID Cafe</th>
            <th>Kategori</th>
            <th class="text-right">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="items.length === 0">
            <td
              colspan="7"
              class="text-center py-6"
            >
              Belum ada data item
            </td>
          </tr>
          <tr
            v-for="item in items"
            :key="item.id"
          >
            <td>
              <VAvatar
                size="40"
                rounded
                :image="item.foto || undefined"
                color="grey-lighten-3"
              />
            </td>
            <td>{{ item.nama }}</td>
            <td>Rp {{ formatRupiah(item.harga) }}</td>
            <td>{{ item.diskon }}%</td>
            <td>{{ item.id_cafe }}</td>
            <td>{{ item.kategori }}</td>
            <td class="text-right">
              <VBtn
                size="small"
                color="warning"
                variant="tonal"
                class="me-2"
                @click="openEditModal(item)"
              >
                Edit
              </VBtn>
              <VBtn
                size="small"
                color="error"
                variant="tonal"
                @click="deleteItem(item.id)"
              >
                Del
              </VBtn>
            </td>
          </tr>
        </tbody>
      </VTable>
    </VCard>

    <ItemFormDialog
      v-model="isFormDialogOpen"
      :item="selectedItem"
      @save="saveItem"
    />
  </div>
</template>
