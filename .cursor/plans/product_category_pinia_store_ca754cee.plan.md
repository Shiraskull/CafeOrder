---
name: Product category Pinia store
overview: Menambahkan store Pinia baru untuk data kategori produk dengan satu action GET ke endpoint `categories/:id` dan query `ts` untuk cache busting, mengikuti pola `orderStore.js` dan import `api` dari `@/plugins/axios`.
todos:
  - id: add-category-store
    content: "Buat `src/plugins/store/categoryStore.js` dengan state loading/error/category, action `fetchCategoryById(id)` memakai `api.get(\\`categories/${id}\\`, { params: { ts: Date.now() } })`"
    status: completed
  - id: wire-or-verify
    content: "Opsional: import `useCategoryStore` di halaman yang perlu (mis. items/order) dan sesuaikan `res.data` jika struktur Laravel berbeda"
    status: completed
isProject: false
---

# Store kategori produk + GET `categories/:id`

## Konteks di codebase

- Store existing memakai **Pinia** `defineStore` + Composition API (`ref`, `computed`), contoh: [`src/plugins/store/orderStore.js`](src/plugins/store/orderStore.js).
- Client HTTP: [`src/plugins/axios.js`](src/plugins/axios.js) — `baseURL` sudah `https://back.ordivapos.com/api/`, jadi path **`categories/9`** (bukan URL penuh) sudah benar; hindari duplikasi seperti di [`src/pages/items.vue`](src/pages/items.vue) yang memakai URL absolut untuk `products`.
- [`src/plugins/store/products.js`](src/plugins/store/products.js) saat ini **kosong**; lebih jelas membuat file khusus kategori daripada mengisi `products.js` (nama file “products” vs domain “categories”).

## Yang akan diimplementasikan

1. **File baru** misalnya [`src/plugins/store/categoryStore.js`](src/plugins/store/categoryStore.js) (alternatif nama: `productCategoryStore.js` jika ingin lebih eksplisit).

2. **Identitas store**
   - `defineStore('category', () => { ... })` — konsisten dengan `'order'` di order store.
   - Export: `useCategoryStore` (atau `useProductCategoryStore` jika dipilih nama file panjang).

3. **State & getter (minimal)**
   - `category` — `ref(null)` untuk payload kategori terakhir yang sukses (atau struktur yang sesuai response API).
   - `loading` — `ref(false)`.
   - `error` — `ref(null)` untuk pesan/error object jika gagal.
   - Opsional: `currentId` — `ref(null)` jika ingin tahu kategori mana yang sedang dimuat.

4. **Action utama** (sesuai contoh Anda)

```js
const res = await api.get(`categories/${id}`, {
  params: { ts: Date.now() },
})
```

   - Bungkus dalam async function, mis. `fetchCategoryById(id)`.
   - Set `loading` true/false, tangani `try/catch`, assign `category.value` dari **`res.data`** (jika backend Laravel membungkus lagi di `data`, sesuaikan sekali jadi `res.data.data` setelah uji response nyata).

5. **Penggunaan di UI** (opsional, tidak wajab untuk “selesai” store)
   - Di halaman yang butuh kategori: `import { useCategoryStore } from '@/plugins/store/categoryStore'` lalu panggil `fetchCategoryById(9)` di `onMounted` atau saat route/param berubah.

Tidak perlu mengubah [`src/plugins/2.pinia.js`](src/plugins/2.pinia.js) — store Pinia terdaftar otomatis saat pertama kali dipakai.

## Catatan response API

Tanpa contoh JSON dari backend, rencana ini menyimpan isi response secara generik. Setelah integrasi, rapikan mapping field (nama kategori, daftar produk di kategori, dll.) di satu tempat di store agar komponen tidak bergantung pada bentuk mentah API.
