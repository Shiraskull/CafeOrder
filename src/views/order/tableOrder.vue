<script setup>
import TableCard from '@/views/order/TableCard.vue'

const props = defineProps({
  tables: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['order-table'])

const onTableSelect = table => {
  emit('order-table', table)
}
</script>

<template>
  <div class="table-order">
    <div class="table-order-grid-scroll">
      <div class="table-order-grid">
        <div
          v-for="table in tables"
          :key="table.id"
          class="table-order-grid__item"
        >
          <TableCard
            :table="table"
            @click="onTableSelect"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.table-order {
  display: flex;
  flex-direction: column;
  flex: 1 1 0;
  min-block-size: 0;
  padding: 1rem;
  overflow: hidden;
}

.table-order-grid-scroll {
  flex: 1 1 0;
  min-block-size: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.table-order-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(168px, 1fr));
  gap: 1rem;
  justify-items: center;
  align-content: start;
  padding-block-end: 1rem;
}

.table-order-grid__item {
  display: flex;
  justify-content: center;
}
</style>
