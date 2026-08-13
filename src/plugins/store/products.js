import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/plugins/axios'
import { mapApiProduct } from '@/plugins/store/categoryStore'

function normalizeProductList(payload) {
  if (Array.isArray(payload))
    return payload
  if (payload && typeof payload === 'object') {
    const inner = payload.data ?? payload.products
    if (Array.isArray(inner))
      return inner
  }
  return []
}

function categoryKeyForProduct(p) {
  return String(
    p.category_id
    ?? p.id_cate
    ?? p.category?.id_cate
    ?? p.category?.id
    ?? p.kategori_id
    ?? p.id_kategori
    ?? p.id_category
    ?? 'main',
  )
}

export const useProductStore = defineStore('products', () => {
  const products = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchProducts() {
    loading.value = true
    error.value = null
    try {
      const res = await api.get('/products', {
        params: { ts: Date.now() },
      })
      const raw = res.data?.data ?? res.data
      const list = normalizeProductList(raw)
      products.value = list
        .map(p => mapApiProduct(p, categoryKeyForProduct(p)))
        .filter(Boolean)
      return products.value
    } catch (err) {
      error.value = err?.response?.data?.message ?? err?.message ?? err
      products.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  /** Filter client-side berdasarkan `category` hasil `mapApiProduct` (id kategori). */
  function productsByCategory(category) {
    const key = String(category)
    return products.value.filter(p => p.category === key)
  }

  return {
    products,
    loading,
    error,
    fetchProducts,
    productsByCategory,
  }
})
