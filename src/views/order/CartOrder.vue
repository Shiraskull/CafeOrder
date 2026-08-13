<script setup>
const props = defineProps({
  menuItems: {
    type: Array,
    default: () => [],
  },
  /** Dari categoryStore atau turunan produk; kosong/null = tab dari produk */
  categories: {
    type: Array,
    default: null,
  },
})

const emit = defineEmits(['add-to-cart'])

const searchQuery = ref('')
const activeCategory = ref('')

/** Tab "Semua" — tidak bentrok dengan id kategori numerik dari API. */
const ALL_CATEGORIES = '__all__'

const categoryList = computed(() => {
  const withSemua = list => {
    if (!list.length)
      return [{ id: ALL_CATEGORIES, label: 'Semua', icon: 'tabler-layout-grid' }]
    if (list.length === 1)
      return list

    return [{ id: ALL_CATEGORIES, label: 'Semua', icon: 'tabler-layout-grid' }, ...list]
  }

  if (props.categories?.length)
    return withSemua(props.categories)

  const seen = new Set()
  const out = []
  for (const p of props.menuItems) {
    const c = p.category
    if (c == null || seen.has(String(c)))
      continue
    seen.add(String(c))
    out.push({
      id: String(c),
      label: p.categoryName || String(c),
      icon: 'tabler-category',
    })
  }

  return withSemua(out)
})

watch(categoryList, list => {
  if (!list.length)
    return
  const valid = list.some(c => c.id === activeCategory.value)
  if (!valid)
    activeCategory.value = list[0].id
}, { immediate: true })

const activeCategoryLabel = computed(() => {
  const cat = categoryList.value.find(c => c.id === activeCategory.value)

  return cat?.label || 'kategori ini'
})

const filteredItems = computed(() => {
  let list
  if (!activeCategory.value || activeCategory.value === ALL_CATEGORIES)
    list = [...props.menuItems]
  else
    list = props.menuItems.filter(item => String(item.category) === String(activeCategory.value))
  const q = searchQuery.value.trim().toLowerCase()
  if (q)
    list = list.filter(item => item.name.toLowerCase().includes(q))

  return list
})

const formatRp = n => `Rp ${new Intl.NumberFormat('id-ID').format(n)}`

const onAddToCart = item => {
  emit('add-to-cart', item)
}
</script>

<template>
  <div class="cart-order">
    <div class="cart-order-header">
      <!-- <VBtn
        variant="text"
        color="success"
        class="text-none font-weight-medium px-0"
      >
        + ADD NEW ITEM
      </VBtn> -->
      <VTextField
        v-model="searchQuery"
        placeholder="Search items here..."
        density="compact"
        hide-details
        class="cart-order-search"
        style="max-inline-size: 320px;"
      >
        <template #append-inner>
          <VBtn
            icon
            size="small"
            color="success"
            variant="flat"
          >
            <VIcon
              icon="tabler-search"
              size="20"
            />
          </VBtn>
        </template>
      </VTextField>
    </div>

    <div class="cart-order-grid-scroll">
      <div
        v-if="filteredItems.length"
        class="cart-order-grid"
      >
        <VCard
          v-for="item in filteredItems"
          :key="item.id"
          variant="outlined"
          class="cart-order-card"
          @click="onAddToCart(item)"
        >
          <VImg
            :src="item.image"
            :alt="item.name"
            cover
            aspect-ratio="1"
            class="cart-order-card-img"
          />
          <VCardText class="cart-order-card-body">
            <div class="cart-order-card-name">
              {{ item.name }}
            </div>
            <div class="cart-order-card-price text-success font-weight-medium">
              {{ formatRp(item.price) }}
            </div>
          </VCardText>
        </VCard>
      </div>

      <VCard
        v-else
        variant="tonal"
        class="cart-order-empty"
      >
        <VCardText class="text-center py-10">
          <VIcon
            icon="tabler-box-off"
            size="40"
            class="mb-3 text-medium-emphasis"
          />
          <div class="text-body-1 font-weight-medium">
            Belum ada item untuk kategori ini
          </div>
          <div class="text-caption text-medium-emphasis mt-1">
            {{ activeCategoryLabel }}
          </div>
        </VCardText>
      </VCard>
    </div>

    <div class="cart-order-categories">
      <VBtn
        v-for="cat in categoryList"
        :key="cat.id"
        :color="activeCategory === cat.id ? 'success' : undefined"
        :variant="activeCategory === cat.id ? 'flat' : 'tonal'"
        class="cart-order-cat-btn"
        @click="activeCategory = cat.id"
      >
        <VIcon
          :icon="cat.icon"
          size="20"
          class="me-1"
        />
        {{ cat.label }}
      </VBtn>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.cart-order {
  display: flex;
  flex-direction: column;
  flex: 1 1 0;
  min-block-size: 0;
  padding: 1rem;
  overflow: hidden;
}

.cart-order-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  margin-block-end: 1rem;
  flex-wrap: wrap;
}

.cart-order-search {
  flex-grow: 1;
  min-inline-size: 200px;
}

.cart-order-grid-scroll {
  flex: 1 1 0;
  min-block-size: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.cart-order-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  align-content: start;
  padding-block-end: 0.5rem;
}

.cart-order-empty {
  margin-block: 1rem;
}

.cart-order-card {
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
  display: flex;
  flex-direction: column;
  min-block-size: 0;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
}

.cart-order-card-img {
  flex-shrink: 0;
  border-radius: inherit;
  aspect-ratio: 1;
  object-fit: cover;
}

.cart-order-card-body {
  flex-shrink: 0;
  border-block-start: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  padding: 6px 8px !important;
}

.cart-order-card-name {
  font-size: 0.7rem;
  line-height: 1.25;
  display: block;
  overflow-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
}

.cart-order-card-price {
  font-size: 0.7rem;
  margin-block-start: 4px;
  display: block;
}

.cart-order-categories {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding-block-start: 1rem;
  border-block-start: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  margin-block-start: 1rem;
}

.cart-order-cat-btn {
  text-transform: none;
}

@media (min-width: 1280px) {
  .cart-order-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (max-width: 959px) {
  .cart-order-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
