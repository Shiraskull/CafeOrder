<script setup>
import { useNotificationStore } from '@/plugins/store/notificationStore'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const notificationStore = useNotificationStore()

onMounted(() => {
  notificationStore.fetchNotifications()
})

const handleNotificationClick = notification => {
  if (!notification.isSeen)
    notificationStore.markRead([notification.id])

  if (notification.type === 'pesanan.baru')
    router.push('/cooking')
}
</script>

<template>
  <Notifications
    :notifications="notificationStore.bellItems"
    @remove="notificationStore.removeNotification"
    @read="notificationStore.markRead"
    @unread="notificationStore.markUnread"
    @click:notification="handleNotificationClick"
  />
</template>
