import { defineStore } from "pinia";
import { computed, ref } from "vue";
import api from "@/plugins/axios";

/**
 * Store pesanan kasir/dapur/history.
 * - fetchOrder → GET /pesanans/details (aktif saja)
 * - fetchHistory → GET /pesanans/history (selesai + pagination)
 */
export const useOrderStore = defineStore("order", () => {
  /**
   * Pesanan aktif per meja (dari fetchOrder).
   * Bentuk: [{ nomor, orders: [...] }, ...]
   */
  const orders = ref([]);

  /** Flat list halaman history saat ini (dari fetchHistory). */
  const historyOrders = ref([]);

  const historyMeta = ref({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  });

  const historyLoading = ref(false);

  const cookingOrders = computed(() => {
    return orders.value
      .map((meja) => ({
        ...meja,
        orders: (meja.orders || []).filter((order) => order.status === "order"),
      }))
      .filter((meja) => meja.orders.length > 0);
  });

  const cashierOrders = computed(() => {
    return orders.value
      .map((meja) => ({
        ...meja,
        orders: (meja.orders || []).filter((order) =>
          ["order", "antar"].includes(order.status)
        ),
      }))
      .filter((meja) => meja.orders.length > 0);
  });

  /** @deprecated pakai historyOrders; tetap ada untuk kompatibilitas */
  const completedOrders = computed(() => {
    // History sekarang flat dari API terpisah — bungkus mirip struktur lama bila perlu
    if (!historyOrders.value.length) return [];

    const byMeja = {};
    for (const row of historyOrders.value) {
      const key = row.tableId || row.tableName || "Lain";
      if (!byMeja[key]) {
        byMeja[key] = {
          nomor: key,
          tableName: row.tableName,
          orders: [],
        };
      }
      byMeja[key].orders.push({
        id: row.id,
        waktu: row.waktu,
        status: "selesai",
        nama_order: row.namaOrder,
        no_pesanan: row.noPesanan,
        items: row.items,
      });
    }
    return Object.values(byMeja);
  });

  function mapApiStatus(p) {
    const allowed = ["order", "antar", "selesai", "batal"];
    if (typeof p.status === "string" && allowed.includes(p.status))
      return p.status;

    if (Number(p.status_bill) === 1) return "selesai";

    const s = Number(p.status);
    if (s === 2) return "selesai";
    if (s === 1) return "antar";

    return "order";
  }

  function mapDetailItems(details) {
    return (details || []).map((d) => ({
      name:
        (typeof d.product === "string" ? d.product : null) ??
        d.nama_product ??
        d.productItem?.nama ??
        d.product_item?.nama ??
        d.product?.nama ??
        `Product ${d.product_id ?? (typeof d.product === "number" ? d.product : "?")}`,
      qty: d.jumlah ?? 0,
      catatan: d.note || undefined,
      note: d.note || undefined,
      price: Number(
        d.price ?? d.harga ?? d.productItem?.harga ?? d.product?.harga ?? 0
      ),
      image: d.image ?? d.productItem?.image ?? d.product?.image ?? "",
    }));
  }

  function mapPesananToOrder(p) {
    return {
      id: String(p.id_pesan),
      waktu: p.created_at ? new Date(p.created_at) : null,
      status: mapApiStatus(p),
      nama_order: p.nama_order,
      no_pesanan: p.no_pesanan,
      items: mapDetailItems(p.details),
    };
  }

  function groupPesananByMeja(rawPesanans) {
    const list = Array.isArray(rawPesanans) ? rawPesanans : [];
    const byMeja = {};

    for (const p of list) {
      const key = p.noMeja != null ? p.noMeja : "Lain";
      if (!byMeja[key]) byMeja[key] = [];
      byMeja[key].push(p);
    }

    return Object.entries(byMeja)
      .map(([mejaKey, pesananList]) => {
        const sorted = [...pesananList].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        return {
          nomor: mejaKey === "Lain" ? "Meja Lain" : `Meja ${mejaKey}`,
          idMeja:
            sorted[0]?.id_meja ??
            sorted[0]?.meja_id ??
            sorted[0]?.table_id ??
            null,
          tableName:
            sorted[0]?.table_name ??
            sorted[0]?.nama_meja ??
            sorted[0]?.nama ??
            null,
          tableCode: sorted[0]?.table_code ?? sorted[0]?.tableCode ?? null,
          orders: sorted.map(mapPesananToOrder),
        };
      })
      .sort((a, b) => {
        const timeA = a.orders[0]?.waktu ? new Date(a.orders[0].waktu) : 0;
        const timeB = b.orders[0]?.waktu ? new Date(b.orders[0].waktu) : 0;
        return timeB - timeA;
      });
  }

  function mapHistoryRow(p) {
    const items = mapDetailItems(p.details);
    const total = items.reduce(
      (sum, item) => sum + Number(item.qty || 0) * Number(item.price || 0),
      0
    );
    const tableName =
      p.nama_meja ||
      p.table_name ||
      (p.noMeja != null ? `Meja ${p.noMeja}` : "-");

    return {
      id: String(p.id_pesan),
      tableName,
      tableId: p.noMeja != null ? `Meja ${p.noMeja}` : tableName,
      waktu: p.created_at ? new Date(p.created_at) : null,
      namaOrder: p.nama_order || "-",
      noPesanan: p.no_pesanan || "-",
      status: "selesai",
      items,
      itemSummary:
        items.map((i) => `${i.qty}x ${i.name}`).join(", ") || "-",
      itemCount: items.reduce((sum, i) => sum + Number(i.qty || 0), 0),
      total: Number(p.total ?? total),
    };
  }

  function updateOrderStatus(orderId, newStatus) {
    const id = String(orderId);
    const table = orders.value.find((meja) =>
      meja.orders?.some((order) => String(order.id) === id)
    );
    const order = table?.orders?.find((order) => String(order.id) === id);
    if (!order) return;

    order.status = newStatus;
    if (newStatus === "selesai") order.waktuSelesai = new Date();
  }

  async function patchOrderStatus(orderId, newStatus) {
    const id = String(orderId);
    const prev = (() => {
      const table = orders.value.find((meja) =>
        meja.orders?.some((order) => String(order.id) === id)
      );
      return table?.orders?.find((order) => String(order.id) === id)?.status;
    })();

    updateOrderStatus(id, newStatus);

    try {
      await api.patch(`/pesanan/${id}/status`, { status: newStatus });
      return true;
    } catch (err) {
      console.error("patchOrderStatus error:", err);
      if (prev != null) updateOrderStatus(id, prev);
      throw err;
    }
  }

  function sendOrderToKitchen(orderId) {
    return patchOrderStatus(orderId, "order");
  }
  function sendOrder(orderId) {
    return patchOrderStatus(orderId, "antar");
  }
  function markAsPaid(orderId) {
    return patchOrderStatus(orderId, "selesai");
  }

  function addOrder(newOrder) {
    const allOrderIds = orders.value.flatMap((m) =>
      (m.orders || []).map((o) => Number(o.id) || 0)
    );
    const newId = (allOrderIds.length ? Math.max(...allOrderIds) : 0) + 1;
    orders.value.push({
      id: newId,
      ...newOrder,
      status: "order",
      waktuMulai: new Date(),
    });
  }

  async function createPesanan(payload) {
    const res = await api.post("/pesanans/post", payload);
    await fetchOrder();
    return res.data;
  }

  /**
   * GET /pesanans/details — hanya pesanan aktif.
   */
  async function fetchOrder() {
    try {
      const res = await api.get("/pesanans/details", {
        params: { ts: Date.now() },
      });
      const rawPesanans = Array.isArray(res.data)
        ? res.data
        : res.data?.data ?? [];
      orders.value = groupPesananByMeja(rawPesanans);
      return orders.value;
    } catch (err) {
      console.error("fetchOrder error:", err);
      orders.value = [];
      return [];
    }
  }

  /**
   * GET /pesanans/history — selesai + pagination server.
   * @param {{ page?: number, perPage?: number, search?: string }} opts
   */
  async function fetchHistory(opts = {}) {
    const page = opts.page ?? historyMeta.value.current_page ?? 1;
    const perPage = opts.perPage ?? historyMeta.value.per_page ?? 10;
    const search = opts.search ?? "";

    historyLoading.value = true;
    try {
      const res = await api.get("/pesanans/history", {
        params: {
          page,
          per_page: perPage,
          search: search || undefined,
          ts: Date.now(),
        },
      });

      const payload = res.data ?? {};
      const rawList = Array.isArray(payload.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : [];

      historyOrders.value = rawList.map(mapHistoryRow);

      historyMeta.value = {
        current_page: Number(payload.current_page ?? page),
        last_page: Number(payload.last_page ?? 1),
        per_page: Number(payload.per_page ?? perPage),
        total: Number(payload.total ?? rawList.length),
        from: Number(payload.from ?? 0),
        to: Number(payload.to ?? 0),
      };

      return historyOrders.value;
    } catch (err) {
      console.error("fetchHistory error:", err);
      historyOrders.value = [];
      historyMeta.value = {
        current_page: 1,
        last_page: 1,
        per_page: perPage,
        total: 0,
        from: 0,
        to: 0,
      };
      throw err;
    } finally {
      historyLoading.value = false;
    }
  }

  return {
    orders,
    historyOrders,
    historyMeta,
    historyLoading,
    cookingOrders,
    cashierOrders,
    completedOrders,
    updateOrderStatus,
    patchOrderStatus,
    fetchOrder,
    fetchHistory,
    createPesanan,
    UpdateOrderStatus: updateOrderStatus,
    sendOrderToKitchen,
    sendOrder,
    markAsPaid,
    addOrder,
  };
});
