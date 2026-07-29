import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import api from '@/plugins/axios'

function childCategories(c) {
  if (!c || typeof c !== 'object')
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

export function mapApiProduct(p, categoryKey) {
  if (!p || typeof p !== 'object')
    return null
  const id = p.id ?? p.product_id
  if (id == null)
    return null
  return {
    id,
    name: p.nama ?? p.name ?? '',
    price: Number(p.harga ?? p.price ?? 0),
    image: p.image ?? p.foto ?? p.gambar ?? '',
    category: String(categoryKey),
  }
}

export const useCategoryStore = defineStore('category', () => {
  const category = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const currentId = ref(null)

  const categoryNavItems = computed(() => {
    const c = category.value
    if (!c)
      return []

    const kids = childCategories(c)
    if (Array.isArray(kids) && kids.length) {
      return kids.map((k, i) => ({
        id: String(k.id ?? k.slug ?? `sub-${i}`),
        label: k.nama ?? k.name ?? k.title ?? `Kategori ${i + 1}`,
        icon: k.icon ?? 'tabler-category',
      }))
    }

    const id = String(c.id ?? 'main')
    return [{
      id,
      label: c.nama ?? c.name ?? c.title ?? 'Menu',
      icon: 'tabler-tools-kitchen-2',
    }]
  })

  const menuItemsFromCategory = computed(() => {
    const c = category.value
    if (!c)
      return []

    const kids = childCategories(c)
    if (Array.isArray(kids) && kids.length) {
      const out = []
      kids.forEach((k, i) => {
        const catKey = String(k.id ?? k.slug ?? `sub-${i}`)
        for (const p of productList(k)) {
          const row = mapApiProduct(p, catKey)
          if (row)
            out.push(row)
        }
      })
      return out
    }

    const catKey = String(c.id ?? 'main')
    return productList(c)
      .map(p => mapApiProduct(p, catKey))
      .filter(Boolean)
  })

  async function fetchCategoryById(id) {
    loading.value = true
    error.value = null
    currentId.value = id
    try {
      const res = await api.get(`categories/${id}`, {
        params: { ts: Date.now() },
      })
      category.value = res.data?.data ?? res.data
      return category.value
    } catch (err) {
      error.value = err?.response?.data?.message ?? err?.message ?? err
      category.value = null
      throw err
    } finally {
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
