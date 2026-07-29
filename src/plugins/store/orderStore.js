import { defineStore } from "pinia";
import { computed, ref } from "vue";
import api from "@/plugins/axios";

/**
 * Store pesanan kasir/dapur: data utama dari GET /pesanans/details (lihat fetchOrder).
 * Getter memisahkan tampilan — cookingOrders (dapur), cashierOrders (kasir aktif), completedOrders.
 */
export const useOrderStore =  defineStore('order',()=>{
  /**
   * Satu-satunya sumber data order setelah fetch API.
   * Bentuk: array of { nomor: "Meja 1", orders: [ { id, waktu, status, items, ... } ] }
   * Diisi oleh fetchOrder(); kosong sampai fetch sukses.
   */
  const orders = ref([]);

  /**
   * Dapur — sementara: semua pesanan per meja (filter status dimatikan).
   * Nanti aktifkan lagi: hanya `order.status === 'order'`.
   */
const cookingOrders = computed(() => {
  return orders.value
    .map(meja => ({
      ...meja,
      orders: [...(meja.orders || [])],
      // orders: meja.orders.filter(order => order.status === 'order'),
    }))
    .filter(meja => meja.orders.length > 0)
})

  /**
   * Kasir / index meja — sementara: semua pesanan (tanpa filter order|antar|selesai).
   * Nanti aktifkan lagi: filter `['order', 'antar'].includes(order.status)`.
   */
const cashierOrders  = computed(() => {
  return orders.value
    .map(meja => ({
      ...meja,
      orders: [...(meja.orders || [])],
      // orders: meja.orders.filter(order => ['order', 'antar'].includes(order.status)),
    }))
    .filter(meja => meja.orders.length > 0)
})

  /**
   * Riwayat — sementara: sama seperti data penuh per meja (filter selesai dimatikan).
   * Nanti aktifkan lagi: `order.status === 'selesai'`.
   */
const completedOrders  = computed(() => {
  return orders.value
    .map(meja => ({
      ...meja,
      orders: [...(meja.orders || [])],
      // orders: meja.orders.filter(order => order.status === 'selesai'),
    }))
    .filter(meja => meja.orders.length > 0)
})


//   ===action===   
    function updateOrderStatus(orderId, newStatus) {
        const table = orders.value.find(meja => meja.orders?.some(order => order.id === orderId))
        const order = table?.orders?.find(order => order.id === orderId)
        if (!order)
          return

        console.log(`🔄 Order #${orderId} (${table?.nomor || '-'}) : ${order.status} → ${newStatus}`)
        order.status = newStatus
        if (newStatus === 'selesai')
          order.waktuSelesai = new Date()
    }
    function sendOrderToKitchen(orderId){
        updateOrderStatus(orderId,'order')
    }
    function sendOrder(orderId){
        updateOrderStatus(orderId,'antar')
    }
    function markAsPaid(orderId){
        updateOrderStatus(orderId,'selesai')
    }
  function addOrder(newOrder) {
    const allOrderIds = orders.value.flatMap((m) => (m.orders || []).map((o) => Number(o.id) || 0));
    const newId = (allOrderIds.length ? Math.max(...allOrderIds) : 0) + 1;
    orders.value.push({
      id: newId,
      ...newOrder,
      status: "order",
      waktuMulai: new Date(),
    });
    console.log(`✅ Order baru #${newId} ditambahkan`);
  }

  /**
   * Buat pesanan (POST). Setelah sukses, panggil fetchOrder agar state mengikuti server.
   *
   * Endpoint: POST /pesanans/post — body sesuai API (mis. noMeja, noCafe, nama_order, method, cash, details[]).
   */
  async function createPesanan(payload) {
    console.log();
    
    const res = await api.post("/pesanans/post", payload);
    await fetchOrder();
    return res.data;
  }

  /**
   * Ambil daftar pesanan dari backend, lalu normalisasi ke bentuk orders (per meja).
   *
   * Endpoint: GET /pesanans/details (path relatif ke baseURL axios, mis. .../api/pesanans/details).
   * Query ts: cache-busting agar tidak dapat response browser cache lama.
   *
   * Backend diharapkan mengembalikan { data: [ ... ] } — array pesanan per baris.
   * Kalau array ada di key lain (mis. res.data saja), sesuaikan rawPesanans di bawah.
   */
  async function fetchOrder() {
    try {
      const res = await api.get("/pesanans/details", {
        params: { ts: Date.now() },
      });
      // Opsional: lihat response lengkap; pastikan array ada di res.data.data
      
      const rawPesanans = res.data ?? [];
      console.log(rawPesanans);

      // Kumpulkan semua baris pesanan per nomor meja (noMeja dari API)
      const byMeja = {};
      for (const p of rawPesanans) {
        const key = p.noMeja != null ? p.noMeja : "Lain";
        if (!byMeja[key]) byMeja[key] = [];
        byMeja[key].push(p);
      }

      // Ubah jadi struktur UI: satu entri per meja, banyak order di dalamnya
      const grouped = Object.entries(byMeja)
        .map(([mejaKey, pesananList]) => {
          const sorted = [...pesananList].sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );
          return {
            nomor: mejaKey === "Lain" ? "Meja Lain" : `Meja ${mejaKey}`,
            idMeja: sorted[0]?.id_meja ?? sorted[0]?.meja_id ?? sorted[0]?.table_id ?? null,
            tableName: sorted[0]?.table_name ?? sorted[0]?.nama_meja ?? sorted[0]?.nama ?? null,
            tableCode: sorted[0]?.table_code ?? sorted[0]?.tableCode ?? null,
            orders: sorted.map((p) => ({
          id: String(p.id_pesan),
          waktu: new Date(p.created_at),
          // Sementara: semua di UI sebagai 'order' (filter getter sudah dimatikan).
          // Nanti balikin: total > 0 dari API = lunas → 'selesai'.
          // status: "order",
          // status: p.total != null && p.total > 0 ? "selesai" : "order",
          nama_order: p.nama_order,
          no_pesanan: p.no_pesanan,
          items: (p.details || []).map((d) => ({
            name: d.nama_product ?? d.product?.nama ?? `Product ${d.product_id}`,
            qty: d.jumlah ?? 0,
            catatan: d.note || undefined,
            price: d.harga ?? d.product?.harga ?? 0,
            image: d.image ?? d.product?.image ?? "",
          })),
        })),
          };
        })
        // Meja dengan aktivitas terbaru di atas (pakai waktu order pertama di grup)
        .sort((a, b) => {
          const timeA = a.orders[0]?.waktu ? new Date(a.orders[0].waktu) : 0;
          const timeB = b.orders[0]?.waktu ? new Date(b.orders[0].waktu) : 0;
          return timeB - timeA;
        });

      orders.value = grouped;
      console.log(orders.value);
      
      return orders.value;
    } catch (err) {
      console.error("fetchOrder error:", err);
      orders.value = [];
      return [];
    }
  }
  return {
    // state
    orders,
    // getters
    cookingOrders,
    cashierOrders,
    completedOrders,
    // actions
    updateOrderStatus,
    fetchOrder,
    createPesanan,
    UpdateOrderStatus: updateOrderStatus,
    sendOrderToKitchen,
    sendOrder,
    markAsPaid,
    addOrder
  }
})
