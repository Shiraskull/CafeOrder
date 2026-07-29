<script setup>
import TableCard from '@/views/order/TableCard.vue'

const props = defineProps({
  tables: {
    type: Array,
    default: () => [],
  },
  showActions: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['edit-table', 'delete-table'])

const gridRoot = ref(null)
const selectedTableId = ref(null)

onClickOutside(gridRoot, () => {
  selectedTableId.value = null
})

watch(
  () => props.tables,
  () => {
    const id = selectedTableId.value
    if (id != null && !props.tables.some(t => t.id === id))
      selectedTableId.value = null
  },
  { deep: true },
)

watch(
  () => props.showActions,
  v => {
    if (!v)
      selectedTableId.value = null
  },
)

function onTableCardClick(table) {
  if (!props.showActions)
    return
  if (selectedTableId.value === table.id)
    selectedTableId.value = null
  else
    selectedTableId.value = table.id
}

function onEdit(table) {
  selectedTableId.value = null
  emit('edit-table', table)
}

function onDelete(table) {
  selectedTableId.value = null
  emit('delete-table', table)
}
</script>

<template>
  <div
    ref="gridRoot"
    class="table-layout-grid"
  >
    <div
      v-for="table in tables"
      :key="table.id"
      class="table-layout-grid__item"
    >
      <div class="table-layout-grid__row">
        <TableCard
          :table="table"
          :selected="showActions && selectedTableId === table.id"
          @click="onTableCardClick(table)"
        />
        <Transition name="table-layout-fade">
          <div
            v-if="showActions && selectedTableId === table.id"
            class="table-layout-grid__actions-side"
            @click.stop
          >
            <VBtn
              icon
              size="small"
              variant="tonal"
              color="primary"
              class="table-layout-grid__action-btn"
              @click="onEdit(table)"
            >
              <VIcon
                icon="tabler-pencil"
                size="20"
              />
            </VBtn>
            <VTooltip
              v-if="table.status === 'terisi'"
              location="start"
            >
              <template #activator="{ props: tip }">
                <span v-bind="tip">
                  <VBtn
                    icon
                    size="small"
                    variant="tonal"
                    color="error"
                    disabled
                    class="table-layout-grid__action-btn"
                  >
                    <VIcon
                      icon="tabler-trash"
                      size="20"
                    />
                  </VBtn>
                </span>
              </template>
              <span>Kosongkan meja dulu sebelum hapus</span>
            </VTooltip>
            <VBtn
              v-else
              icon
              size="small"
              variant="tonal"
              color="error"
              class="table-layout-grid__action-btn"
              @click="onDelete(table)"
            >
              <VIcon
                icon="tabler-trash"
                size="20"
              />
            </VBtn>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.table-layout-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
  justify-items: center;
}

.table-layout-grid__item {
  display: flex;
  justify-content: center;
  min-inline-size: 0;
}

.table-layout-grid__row {
  display: inline-flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 10px;
}

.table-layout-grid__actions-side {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-block-start: 28px;
}

.table-layout-fade-enter-active,
.table-layout-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.table-layout-fade-enter-from,
.table-layout-fade-leave-to {
  opacity: 0;
  transform: translateX(-6px);
}
</style>
