<script setup>
import PaymentMethodForm from '@/views/order/PaymentMethodForm.vue'

const sampleTotal = 125000

function onPaymentConfirm(payload) {
  console.log('Payment confirmed:', payload)
}
</script>

<template>
  <div class="pa-6">
    <h1 class="text-h4 mb-2">
      Pembayaran
    </h1>
    <p class="text-body-2 text-medium-emphasis mb-6">
      Pilih metode pembayaran (Cash atau QRIS) — tanpa tombol konfirmasi.
    </p>

    <div class="payment-page-wrap">
      <PaymentMethodForm
        :total="sampleTotal"
        :show-cancel="false"
        selection-only
        @confirm="onPaymentConfirm"
      />
    </div>
  </div>
</template>

<style scoped>
.payment-page-wrap {
  max-width: 420px;
}
</style>
