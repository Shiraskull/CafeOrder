import { defineStore } from "pinia";
import { computed, ref } from "vue";
import api from "@/plugins/axios";
import { echo } from "@/plugins/echo";

/** Sementara — samakan dengan create.vue sampai tenant/login punya noCafe. */
const NO_CAFE_ID = 1;
const SEEN_KEY = "notificationSeenIds";

function loadSeenIds() {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch {
    return new Set();
  }
}

function saveSeenIds(ids) {
  localStorage.setItem(SEEN_KEY, JSON.stringify([...ids]));
}

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Baru saja";
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function toBellItem(row, seenIds) {
  const id = String(row.id);
  return {
    id: row.id,
    type: row.type || "pesanan.baru",
    title: row.title,
    subtitle: row.body || "",
    time: formatTime(row.created_at),
    isSeen: seenIds.has(id),
    icon: "tabler-tools-kitchen-2",
    color: "warning",
    data: row.data ?? {},
  };
}

export const useNotificationStore = defineStore("notification", () => {
  const items = ref([]);
  const seenIds = ref(loadSeenIds());
  const loading = ref(false);
  let realtimeStarted = false;

  const bellItems = computed(() =>
    items.value.map((row) => toBellItem(row, seenIds.value)),
  );
  const unreadCount = computed(
    () => bellItems.value.filter((n) => !n.isSeen).length,
  );

  function persistSeen() {
    saveSeenIds(seenIds.value);
  }

  function startRealtime() {
    if (realtimeStarted) return;
    if (typeof echo?.channel !== "function") return;

    realtimeStarted = true;
    echo.channel("pesanan").listen(".pesanan.baru", () => {
      fetchNotifications();
    });
  }

  async function fetchNotifications() {
    loading.value = true;
    try {
      const res = await api.get("/notifications", {
        params: { noCafe: NO_CAFE_ID, ts: Date.now() },
      });
      const payload = res.data ?? {};
      items.value = Array.isArray(payload.data) ? payload.data : [];
      return items.value;
    } catch (err) {
      console.error("fetchNotifications error:", err);
      items.value = [];
      return [];
    } finally {
      loading.value = false;
      startRealtime();
    }
  }

  function markRead(ids) {
    const next = new Set(seenIds.value);
    for (const id of Array.isArray(ids) ? ids : [ids])
      next.add(String(id));
    seenIds.value = next;
    persistSeen();
  }

  function markUnread(ids) {
    const next = new Set(seenIds.value);
    for (const id of Array.isArray(ids) ? ids : [ids])
      next.delete(String(id));
    seenIds.value = next;
    persistSeen();
  }

  function removeNotification(id) {
    items.value = items.value.filter((n) => Number(n.id) !== Number(id));
    markRead([id]);
  }

  return {
    items,
    loading,
    bellItems,
    unreadCount,
    fetchNotifications,
    markRead,
    markUnread,
    removeNotification,
  };
});
