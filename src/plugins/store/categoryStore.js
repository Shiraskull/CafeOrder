import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import api from '@/plugins/axios'

function childCategories(c) {
  if (!c || typeof c !== 'object' || Array.isArray(c))
    return null
  return (
    c.children
    ?? c.subcategories
    ?? c.sub_kategori
    ?? c.subKategori
    ?? c.categories
  )
}

function productList(node) {
  if (!node || typeof node !== 'object')
    return []
  const raw = node.products ?? node.product ?? []
  return Array.isArray(raw) ? raw : []
}

function categoryId(c, fallbackIndex = 0) {
  return String(c?.id_cate ?? c?.id ?? c?.slug ?? `cat-${fallbackIndex}`)
}

function categoryLabel(c, fallbackIndex = 0) {
  return (
    c?.category_name
    ?? c?.nama
    ?? c?.name
    ?? c?.title
    ?? `Kategori ${fallbackIndex + 1}`
  )
}

function normalizeCategoryPayload(payload) {
  if (Array.isArray(payload))
    return payload
  if (payload && typeof payload === 'object') {
    if (Array.isArray(payload.data))
      return payload.data
    // single category / tree root
    return payload
  }
  return null
}

export function mapApiProduct(p, categoryKey) {
  if (!p || typeof p !== 'object')
    return null
  const id = p.id ?? p.product_id
  if (id == null)
    return null

  const resolvedKey = categoryKey
    ?? p.category_id
    ?? p.id_cate
    ?? p.category?.id_cate
    ?? p.category?.id
    ?? 'main'

  const categoryName = p.category_name
    ?? p.category?.category_name
    ?? p.category?.nama
    ?? p.category?.name
    ?? null

  return {
    id,
    name: p.nama ?? p.name ?? '',
    price: Number(p.harga ?? p.price ?? 0),
    image: p.image ?? p.foto ?? p.gambar ?? '',
    category: String(resolvedKey),
    categoryName: categoryName != null ? String(categoryName) : null,
  }
}

export const useCategoryStore = defineStore('category', () => {
  /** Array flat kategori, atau satu object tree root */
  const category = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const currentId = ref(null)

  const categoryNavItems = computed(() => {
    const c = category.value
    if (!c)
      return []

    // API getCategoryBy: array flat [{ id_cate, category_name, ... }]
    if (Array.isArray(c)) {
      return c.map((k, i) => ({
        id: categoryId(k, i),
        label: categoryLabel(k, i),
        icon: k.icon ?? 'tabler-category',
      }))
    }

    const kids = childCategories(c)
    if (Array.isArray(kids) && kids.length) {
      return kids.map((k, i) => ({
        id: categoryId(k, i),
        label: categoryLabel(k, i),
        icon: k.icon ?? 'tabler-category',
      }))
    }

    return [{
      id: categoryId(c),
      label: categoryLabel(c),
      icon: c.icon ?? 'tabler-tools-kitchen-2',
    }]
  })

  const menuItemsFromCategory = computed(() => {
    const c = category.value
    if (!c)
      return []

    if (Array.isArray(c)) {
      const out = []
      c.forEach((k, i) => {
        const catKey = categoryId(k, i)
        for (const p of productList(k)) {
          const row = mapApiProduct(p, catKey)
          if (row)
            out.push(row)
        }
      })
      return out
    }

    const kids = childCategories(c)
    if (Array.isArray(kids) && kids.length) {
      const out = []
      kids.forEach((k, i) => {
        const catKey = categoryId(k, i)
        for (const p of productList(k)) {
          const row = mapApiProduct(p, catKey)
          if (row)
            out.push(row)
        }
      })
      return out
    }

    const catKey = categoryId(c)
    return productList(c)
      .map(p => mapApiProduct(p, catKey))
      .filter(Boolean)
  })

  /**
   * GET /categories/{client} — client uniqId atau id_client.
   */
  async function fetchCategoryById(id) {
    loading.value = true
    error.value = null
    currentId.value = id
    try {
      const res = await api.get(`categories/${id}`, {
        params: { ts: Date.now() },
      })
      category.value = normalizeCategoryPayload(res.data?.data ?? res.data)
      return category.value
    }
    catch (err) {
      error.value = err?.response?.data?.message ?? err?.message ?? err
      category.value = null
      throw err
    }
    finally {
      loading.value = false
    }
  }

  return {
    category,
    loading,
    error,
    currentId,
    categoryNavItems,
    menuItemsFromCategory,
    fetchCategoryById,
  }
})
