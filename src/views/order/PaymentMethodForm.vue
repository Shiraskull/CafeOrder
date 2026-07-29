<script setup>
import { computed, watch } from 'vue'

const props = defineProps({
  total: {
    type: Number,
    default: 0,
  },
  /** URL gambar QR code QRIS (dari backend) */
  qrisImageUrl: {
    type: String,
    default: '',
  },
  /** Tampilkan tombol Batal (untuk dipakai di dalam dialog) */
  showCancel: {
    type: Boolean,
    default: false,
  },
  /** Tanpa wrapper VCard (untuk dipakai di dalam dialog yang sudah punya card) */
  noCard: {
    type: Boolean,
    default: false,
  },
  /** Sembunyikan tombol Konfirmasi/Batal (hanya pilih metode pembayaran) */
  selectionOnly: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['confirm', 'cancel', 'input-money', 'payment-method-change'])

const paymentMethod = ref('cash')
const cashReceived = ref(null)

watch(paymentMethod, m => emit('payment-method-change', m), { immediate: true })
const isPaymentSuccess = ref(false)

const totalFormatted = computed(() =>
  `Rp ${Number(props.total || 0).toLocaleString('id-ID')}`,
)

const cashReceivedNum = computed(() => {
  const v = cashReceived.value
  if (v === null || v === undefined || v === '') return 0
  return Number(String(v).replace(/\D/g, '')) || 0
})

const changeAmount = computed(() => {
  if (paymentMethod.value !== 'cash') return 0
  const received = cashReceivedNum.value
  const total = Number(props.total || 0)
  return Math.max(0, received - total)
})

const changeFormatted = computed(() =>
  `Rp ${Number(changeAmount.value).toLocaleString('id-ID')}`,
)

const isCashValid = computed(() => cashReceivedNum.value >= Number(props.total || 0))

const canConfirm = computed(() => {
  if (isPaymentSuccess.value) return false
  if (paymentMethod.value === 'cash') return isCashValid.value
  if (paymentMethod.value === 'qris') return true
  return false
})

const paymentOptions = [
  { id: 'cash', label: 'Cash', icon: 'tabler-cash' },
  { id: 'qris', label: 'QRIS', icon: 'tabler-qrcode' },
]

function onConfirm() {
  if (!canConfirm.value) return
  emit('confirm', {
    method: paymentMethod.value,
    cashReceived: paymentMethod.value === 'cash' ? cashReceivedNum.value : undefined,
    change: paymentMethod.value === 'cash' ? changeAmount.value : undefined,
  })
  isPaymentSuccess.value = true
  paymentMethod.value = 'cash'
  cashReceived.value = null
}

function resetPayment() {
  isPaymentSuccess.value = false
}

function formatCashInput(value) {
  const num = String(value || '').replace(/\D/g, '')
  if (!num) return ''
  return Number(num).toLocaleString('id-ID')
}

function onCashInput(v) {
  
  const raw = String(v || '').replace(/\D/g, '')
  emit('input-money',raw)
  console.log(raw);
  cashReceived.value = raw ? Number(raw) : null
}
</script>

<template>
  <component
    :is="noCard ? 'div' : 'VCard'"
    :class="noCard ? 'payment-single-card-inline' : 'payment-single-card'"
    :variant="noCard ? undefined : 'flat'"
    :rounded="noCard ? undefined : 'lg'"
  >
    <div class="pa-4">
      <div class="text-body-2 text-medium-emphasis mb-3">
        Detail pembayaran
      </div>

      <!-- Pilihan metode: 2 kotak horizontal (Cash | QRIS) -->
      <div class="payment-method-tabs mb-4">
        <div
          v-for="opt in paymentOptions"
          :key="opt.id"
          class="payment-tab"
          :class="{ 'payment-tab--selected': paymentMethod === opt.id && !isPaymentSuccess }"
          @click="!isPaymentSuccess && (paymentMethod = opt.id)"
        >
          <VIcon
            :icon="opt.icon"
            size="28"
            class="payment-tab__icon"
            :color="paymentMethod === opt.id ? 'primary' : undefined"
          />
          <span class="payment-tab__label">{{ opt.label }}</span>
        </div>
      </div>

      <!-- State: sukses -->
      <template v-if="isPaymentSuccess">
        <div class="payment-success text-center py-4">
          <VAvatar
            color="success"
            size="48"
            rounded
            class="mb-2"
          >
            <VIcon icon="tabler-check" size="28" />
          </VAvatar>
          <div class="text-subtitle-1 font-weight-medium mb-1">
            Pembayaran berhasil
          </div>
          <div class="text-body-2 text-medium-emphasis mb-3">
            {{ totalFormatted }}
          </div>
          <VBtn
            variant="tonal"
            color="primary"
            size="small"
            @click="resetPayment"
          >
            Bayar lagi
          </VBtn>
        </div>
      </template>

      <!-- State: form -->
      <template v-else>
        <!-- Cash: input jumlah uang -->
        <div
          v-show="paymentMethod === 'cash'"
          class="payment-fields"
        >
          <VTextField
            :model-value="cashReceived != null ? formatCashInput(cashReceived) : ''"
            label="Jumlah uang diterima"
            placeholder="0"
            density="comfortable"
            hide-details
            class="mb-2"
            @update:model-value="onCashInput"
          />
          <div
            v-if="cashReceivedNum > 0 && changeAmount > 0"
            class="text-body-2 mb-3"
          >
            <span class="text-medium-emphasis">Kembalian:</span>
            <span class="font-weight-medium ms-1">{{ changeFormatted }}</span>
          </div>
          <VAlert
            v-if="cashReceivedNum > 0 && !isCashValid"
            type="warning"
            density="compact"
            variant="tonal"
            class="mt-2"
          >
            Jumlah uang kurang dari total.
          </VAlert>
        </div>

        <!-- QRIS: QR code -->
        <div
          v-show="paymentMethod === 'qris'"
          class="payment-fields text-center py-3"
        >
          <div
            v-if="qrisImageUrl"
            class="qris-image-wrapper mx-auto"
          >
            <VImg
              :src="qrisImageUrl"
              alt="QRIS"
              max-width="200"
              max-height="200"
              contain
            />
          </div>
          <div
            v-else
            class="qris-placeholder mx-auto"
          >
            <VIcon
              icon="tabler-qrcode"
              size="72"
              color="disabled"
            />
            <div class="text-body-2 text-medium-emphasis mt-2">
              QR Code QRIS akan tampil di sini
            </div>
            <div class="text-caption text-disabled mt-1">
              Hubungkan backend untuk generate QRIS
            </div>
          </div>
        </div>

        <div
          v-if="!selectionOnly"
          class="d-flex gap-2 flex-wrap mt-4"
        >
          <VBtn
            v-if="showCancel"
            variant="text"
            @click="emit('cancel')"
          >
            Batal
          </VBtn>
          <VBtn
            color="primary"
            :disabled="!canConfirm"
            @click="onConfirm"
          >
            Konfirmasi Pembayaran
          </VBtn>
        </div>
      </template>
    </div>
  </component>
</template>

<style lang="scss" scoped>
.payment-single-card {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.payment-method-tabs {
  display: flex;
  gap: 0.75rem;
}

.payment-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 12px;
  border: 2px solid rgba(var(--v-border-color), var(--v-border-opacity));
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;

  &:hover {
    background: rgba(var(--v-theme-primary), 0.04);
  }
}

.payment-tab--selected {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.08);
}

.payment-tab__icon {
  flex-shrink: 0;
}

.payment-tab__label {
  font-weight: 600;
  font-size: 0.9375rem;
}

.qris-placeholder {
  inline-size: 200px;
  block-size: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
}

.qris-image-wrapper {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
