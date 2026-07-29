/**
 * Logika gabungan: daftar meja dari API table-orders + status terisi dari cashierOrders.
 * Dipakai table-layout.vue dan order/create (pilih meja).
 */

export function normalizeTableNameKey(s) {
  if (s == null || s === '')
    return ''
  return String(s).toLowerCase().trim().replace(/\s+/g, ' ')
}

/** Angka pertama di label (untuk "Meja 1" vs "Table 1"). */
export function extractTableNumberFromLabel(s) {
  const m = String(s ?? '').match(/\d+/)
  return m ? m[0] : ''
}

export function matchKeysForOrderMeja(meja) {
  const keys = new Set()
  if ((meja.orders?.length ?? 0) === 0)
    return keys
  if (meja.idMeja != null && meja.idMeja !== '')
    keys.add(`id:${String(meja.idMeja)}`)
  const label = meja.tableName ?? meja.nomor ?? ''
  const nk = normalizeTableNameKey(label)
  if (nk)
    keys.add(`name:${nk}`)
  const num = extractTableNumberFromLabel(label)
  if (num)
    keys.add(`num:${num}`)
  const code = meja.tableCode
  if (code != null && String(code).trim() !== '') {
    const ck = normalizeTableNameKey(code)
    if (ck)
      keys.add(`code:${ck}`)
  }
  return keys
}

export function matchKeysForTableRow(row) {
  const keys = new Set()
  if (row.idMeja != null && row.idMeja !== '')
    keys.add(`id:${String(row.idMeja)}`)
  const label = row.tableName ?? ''
  const nk = normalizeTableNameKey(label)
  if (nk)
    keys.add(`name:${nk}`)
  const numFromName = extractTableNumberFromLabel(label)
  if (numFromName)
    keys.add(`num:${numFromName}`)
  const n = Number(row.number)
  if (!Number.isNaN(n) && n > 0)
    keys.add(`num:${String(n)}`)
  const code = row.tableCode
  if (code != null && String(code).trim() !== '') {
    const ck = normalizeTableNameKey(code)
    if (ck)
      keys.add(`code:${ck}`)
  }
  return keys
}

export function tableRowFromApi(raw, index) {
  const idMeja = raw?.id_table ?? raw?.id_meja ?? raw?.idMeja ?? raw?.meja_id ?? raw?.id ?? null
  const tableName = raw?.table_name ?? raw?.nama_meja ?? raw?.nama ?? raw?.name ?? ''
  const tableCode = raw?.table_code ?? raw?.tableCode ?? ''
  /**
   * Jangan pakai raw.number / raw.no — sering sama dengan id DB (mis. 878), bukan nomor tampilan meja.
   */
  const nMeja = raw?.nomor ?? raw?.no_meja
  const nField = nMeja != null && nMeja !== '' ? Number(nMeja) : NaN
  const fromName = extractTableNumberFromLabel(tableName)
  const fromCode = extractTableNumberFromLabel(tableCode)
  let number = index + 1
  if (!Number.isNaN(nField) && nField > 0)
    number = nField
  else if (fromName)
    number = Number(fromName)
  else if (fromCode)
    number = Number(fromCode)

  const id = idMeja != null && idMeja !== '' ? String(idMeja) : `row-${index}`

  return { id, idMeja, number, tableName, tableCode }
}

/** Set kunci dari semua meja yang punya pesanan (cashierOrders). */
export function buildFilledMatchKeySet(cashierOrders) {
  const set = new Set()
  for (const meja of cashierOrders) {
    for (const k of matchKeysForOrderMeja(meja))
      set.add(k)
  }
  return set
}

/**
 * @param {'layout'|'pos'} mode — layout: terisi/kosong (grid admin). pos: occupied/available (TableCard order).
 */
export function buildTableRowsFromStores(tableItems, cashierOrders, mode = 'layout') {
  const filled = buildFilledMatchKeySet(cashierOrders)
  return tableItems.map((raw, index) => {
    const row = tableRowFromApi(raw, index)
    const keys = matchKeysForTableRow(row)
    const isFilled = [...keys].some(k => filled.has(k))
    const status = mode === 'pos'
      ? (isFilled ? 'occupied' : 'available')
      : (isFilled ? 'terisi' : 'kosong')

    return {
      id: row.id,
      idMeja: row.idMeja,
      number: row.number,
      tableName: row.tableName,
      tableCode: row.tableCode,
      status,
      time: null,
      raw,
    }
  })
}
