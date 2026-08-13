<script setup>
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

const router = useRouter()
const ability = useAbility()

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem('userData')
    if (!raw)
      return null

    const stored = JSON.parse(raw)
    if (!stored)
      return null

    const u = stored.user || stored

    return {
      fullName: u.name || u.nama || u.fullName || u.username || u.email || 'User',
      username: u.email || u.username || '',
      avatar: u.photo || u.avatar || null,
      role: u.role ?? '',
    }
  }
  catch {
    return null
  }
}

const userData = ref({
  fullName: 'User',
  username: '',
  avatar: null,
  role: '',
})

onMounted(() => {
  const data = readStoredUser()
  if (data)
    userData.value = data
})

const logout = async () => {
  localStorage.removeItem('userData')

  useCookie('accessToken').value = null
  useCookie('userData').value = null
  useCookie('userAbilityRules').value = null

  ability.update([])
  await router.push('/myLogon')
}

</script>

<template>
  <VBadge
    dot
    bordered
    location="bottom right"
    offset-x="1"
    offset-y="2"
    color="success"
  >
    <VAvatar
      size="38"
      class="cursor-pointer"
      :color="!userData.avatar ? 'primary' : undefined"
      :variant="!userData.avatar ? 'tonal' : undefined"
    >
      <VImg
        v-if="userData.avatar"
        :src="userData.avatar"
      />
      <VIcon
        v-else
        icon="tabler-user"
      />

      <VMenu
        activator="parent"
        width="240"
        location="bottom end"
        offset="12px"
      >
        <VList>
          <VListItem>
            <div class="d-flex gap-2 align-center">
              <VListItemAction>
                <VBadge
                  dot
                  location="bottom right"
                  offset-x="3"
                  offset-y="3"
                  color="success"
                  bordered
                >
                  <VAvatar
                    :color="!userData.avatar ? 'primary' : undefined"
                    :variant="!userData.avatar ? 'tonal' : undefined"
                  >
                    <VImg
                      v-if="userData.avatar"
                      :src="userData.avatar"
                    />
                    <VIcon
                      v-else
                      icon="tabler-user"
                    />
                  </VAvatar>
                </VBadge>
              </VListItemAction>

              <div>
                <h6 class="text-h6 font-weight-medium">
                  {{ userData.fullName || userData.username }}
                </h6>
                <VListItemSubtitle
                  v-if="userData.role !== '' && userData.role != null"
                  class="text-capitalize text-disabled"
                >
                  {{ userData.role }}
                </VListItemSubtitle>
              </div>
            </div>
          </VListItem>

          <PerfectScrollbar :options="{ wheelPropagation: false }">
            <VDivider class="my-2" />

            <div class="px-4 py-2">
              <VBtn
                block
                size="small"
                color="error"
                append-icon="tabler-logout"
                @click="logout"
              >
                Logout
              </VBtn>
            </div>
          </PerfectScrollbar>
        </VList>
      </VMenu>
    </VAvatar>
  </VBadge>
</template>
