<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  item: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'save'])

const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const getDefaultForm = () => ({
  id: null,
  nama: '',
  harga: 0,
  diskon: 0,
  foto: '',
  id_cafe: '',
  kategori: '',
})

const form = ref(getDefaultForm())

const isEditMode = computed(() => Boolean(props.item?.id))

watch(
  () => [props.modelValue, props.item],
  ([open]) => {
    if (!open)
      return

    form.value = props.item ? { ...props.item } : getDefaultForm()
  },
  { immediate: true },
)

const submitForm = () => {
  emit('save', {
    ...form.value,
    harga: Number(form.value.harga) || 0,
    diskon: Number(form.value.diskon) || 0,
  })
  isOpen.value = false
}
</script>

<template>
  <VDialog
    v-model="isOpen"
    max-width="640"
  >
    <VCard>
      <VCardItem>
        <VCardTitle>
          {{ isEditMode ? 'Edit Item' : 'Tambah Item' }}
        </VCardTitle>
      </VCardItem>

      <VCardText>
        <VRow>
          <VCol cols="12">
            <VTextField
              v-model="form.nama"
              label="Nama"
              placeholder="Contoh: Espresso"
            />
          </VCol>

          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model.number="form.harga"
              type="number"
              min="0"
              label="Harga"
              placeholder="0"
            />
          </VCol>

          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model.number="form.diskon"
              type="number"
              min="0"
              max="100"
              label="Diskon (%)"
              placeholder="0"
            />
          </VCol>

          <VCol cols="12">
            <VTextField
              v-model="form.foto"
              label="Foto (URL)"
              placeholder="https://..."
            />
          </VCol>

          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="form.id_cafe"
              label="ID Cafe"
              placeholder="Contoh: CAFE-001"
            />
          </VCol>

          <VCol
            cols="12"
            md="6"
          >
            <VTextField
              v-model="form.kategori"
              label="Kategori"
              placeholder="Contoh: Minuman"
            />
          </VCol>
        </VRow>

        <VImg
          v-if="form.foto"
          :src="form.foto"
          cover
          class="rounded mt-2"
          height="140"
        />
      </VCardText>

      <VCardActions>
        <VSpacer />
        <VBtn
          variant="text"
          @click="isOpen = false"
        >
          Batal
        </VBtn>
        <VBtn
          color="primary"
          @click="submitForm"
        >
          {{ isEditMode ? 'Simpan Perubahan' : 'Tambah Item' }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
