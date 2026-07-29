import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/plugins/axios'

/** Sementara — samakan dengan tenant / login nanti. */
const TABLE_CRUD_CLIENT_ID = 1

/**
 * Backend minta table_code; dari nama saja: angka → M{n}, selain itu slug singkat.
 */
function deriveTableCode(tableName, existingCode) {
  const keep = existingCode != null && String(existingCode).trim() !== ''
    ? String(existingCode).trim()
    : null
  if (keep)
    return keep
  const name = String(tableName || '').trim()
  const digits = name.match(/(\d+)/)
  if (digits)
    return `M${digits[1]}`
  const slug = name.replace(/[^a-zA-Z0-9]+/g, '').toUpperCase().slice(0, 12)
  return slug || 'M1'
}

/**
 * Data dari GET /table-orders (relatif ke baseURL axios).
 */
export const useTableOrdersStore = defineStore('tableOrders', () => {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  function normalizePayload(body) {
    if (Array.isArray(body))
      return body
    if (body && typeof body === 'object') {
      const inner = body.data ?? body.tables_orders ?? body.tablesOrders
      if (Array.isArray(inner))
        return inner
    }
    return []
  }

  async function fetchTablesOrders() {
    loading.value = true
    error.value = null
    try {
      const res = await api.get('/table-orders', {
        params: { ts: Date.now() },
      })
      console.log(res);
      
      const raw = res.data?.data ?? res.data
      items.value = normalizePayload(raw)
      return items.value
    }
    catch (err) {
      error.value = err?.response?.data?.message ?? err?.message ?? err
      items.value = []
      throw err
    }
    finally {
      loading.value = false
    }
  }

  /**
   * Primary key untuk URL — sesuaikan jika backend pakai nama lain.
   */
  function resolveTableId(row) {
    if (!row || typeof row !== 'object')
      return null
    return row.id ?? row.id_meja ?? row.meja_id ?? null
  }

  async function createTable(payload) {
    loading.value = true
    error.value = null
    try {
      const body = {
        client_id: 1,
        table_name: payload.table_name,
        table_code: "MV1",
      }
      await api.post('/table-orders', body)
      await fetchTablesOrders()
    }
    catch (err) {
      error.value = err?.response?.data?.message ?? err?.message ?? err
      throw err
    }
    finally {
      loading.value = false
    }
  }

  async function updateTable(row, payload) {
    const tid = resolveTableId(row)
    if (tid == null) {
      const err = new Error('ID meja tidak ditemukan')
      error.value = err.message
      throw err
    }
    loading.value = true
    error.value = null
    try {
      const existing = row?.table_code ?? row?.tableCode ?? null
      const body = {
        client_id: TABLE_CRUD_CLIENT_ID,
        table_name: payload.table_name,
        table_code: deriveTableCode(payload.table_name, existing),
      }
      await api.put(`/tables-orders/${tid}`, body)
      await fetchTablesOrders()
    }
    catch (err) {
      error.value = err?.response?.data?.message ?? err?.message ?? err
      throw err
    }
    finally {
      loading.value = false
    }
  }

  async function deleteTable(row) {
    const tid = resolveTableId(row)
    if (tid == null) {
      const err = new Error('ID meja tidak ditemukan')
      error.value = err.message
      throw err
    }
    loading.value = true
    error.value = null
    try {
      await api.delete(`/tables-orders/${tid}`)
      await fetchTablesOrders()
    }
    catch (err) {
      error.value = err?.response?.data?.message ?? err?.message ?? err
      throw err
    }
    finally {
      loading.value = false
    }
  }

  return {
    items,
    loading,
    error,
    fetchTablesOrders,
    createTable,
    updateTable,
    deleteTable,
  }
})
