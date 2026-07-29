---
name: Product Pinia store GET
overview: "Mengisi [`src/plugins/store/products.js`](src/plugins/store/products.js) dengan Pinia store yang memuat daftar produk lewat `GET {category}/products` + `params: { ts: Date.now() }`, mengikuti pola loading/error dan parsing response seperti [`categoryStore.js`](src/plugins/store/categoryStore.js), lalu (opsional) mengganti pemanggilan manual di [`items.vue`](src/pages/items.vue)."
todos:
  - id: implement-product-store
    content: "Isi `src/plugins/store/products.js`: state products/loading/error, `fetchProductsByCategory` dengan `api.get(\\`${category}/products\\`, { params: { ts: Date.now() } })`, normalisasi array + mapping produk (reuse atau mirror `mapApiProduct`)."
    status: completed
  - id: optional-items-vue
    content: "Opsional: `items.vue` pakai `useProductStore` + path relatif, bukan URL absolut ke API."
    status: completed
isProject: false
---

# Store produk dengan GET `{category}/products`

## Konteks

- `[src/plugins/store/products.js](src/plugins/store/products.js)` **kosong**; siap diisi.
- Client HTTP: `[src/plugins/axios.js](src/plugins/axios.js)` — `baseURL` sudah `https://back.ordivapos.com/api/`, jadi path yang benar adalah `**${category}/products`** (contoh: `9/products`), **bukan** URL absolut seperti di `[items.vue](src/pages/items.vue)` baris 66–68.
- Pola store yang sudah dipakai: `[src/plugins/store/categoryStore.js](src/plugins/store/categoryStore.js)` — `defineStore` + Composition API, `loading` / `error`, `try/catch/finally`, payload dari `res.data?.data ?? res.data`, dan helper `mapApiProduct` untuk field API Indonesia/Inggris.

## Implementasi store (`products.js`)

1. **Identitas**: `defineStore('products', () => { ... })`, export `useProductStore` (atau nama yang Anda pakai konsisten di proyek).
2. **State**
  - `products` — `ref([])` daftar produk terakhir yang sukses.
  - `loading`, `error` — sama pola dengan category store.
  - Opsional: `currentCategory` — `ref(null)` untuk id/slug kategori yang sedang dimuat (memudahkan debug dan UI).
3. **Action utama** — sesuai permintaan Anda:

```js
const res = await api.get(`${category}/products`, {
  params: { ts: Date.now() },
})
```

- Parameter `category` bertipe string atau number (contoh: `9` atau slug jika backend mendukung).
- Normalisasi body: array langsung, atau `res.data.data`, atau array di properti umum (`data`, `products`) — samakan dengan satu baris fallback seperti di category store agar kompatibel Laravel.
- Map tiap item ke bentuk yang sama dengan `[mapApiProduct](src/plugins/store/categoryStore.js)` (id, name, price, image, category) — **duplikasi singkat** di file ini *atau* **export** `mapApiProduct` dari `categoryStore.js` dan impor di sini agar tidak drift (pilih satu; export lebih DRY).

1. **Return**: expose state + `fetchProductsByCategory(category)` (nama bisa disesuaikan, mis. `fetchByCategory`).

Tidak perlu mengubah registrasi Pinia — store dipakai saat pertama di-import.

## Integrasi opsional (disarankan agar konsisten)

- Di `[items.vue](src/pages/items.vue)`: ganti `getProoducs` + URL absolut dengan `useProductStore().fetchProductsByCategory(9)` (atau id dari route/env), dan hapus `console.log` debug jika tidak diperlukan.

## Catatan pemisahan dengan `categoryStore`

- `**categories/:id`** (category store) = pohon kategori + produk bersarang untuk navigasi/menu.
- `**{category}/products`** (product store) = endpoint terpisah untuk daftar produk per kategori.

Keduanya bisa dipakai bersamaan di halaman berbeda; pastikan mapping field konsisten agar komponen order/cart tidak perlu tahu sumber API.
