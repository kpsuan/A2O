<script setup lang="ts">
import { ref, computed } from "vue"
import { motion } from "motion-v"
import { CalendarClock, Phone } from "lucide-vue-next"
import AppointmentScheduler from "@/components/scheduler/AppointmentScheduler.vue"
import BookingConfirmedModal from "@/components/scheduler/BookingConfirmedModal.vue"
import Toast from "@/components/ui/Toast.vue"
import Button from "@/components/ui/Button.vue"
import ThemeToggle from "@/components/ui/ThemeToggle.vue"
import { provideTheme } from "@/lib/theme"

type Booking = {
  serviceId: string
  zip: string
  date: string
  slot: string
}

const theme = provideTheme("dark")
const isLight = computed(() => theme.value === "light")

const open = ref(false)
const confirmedOpen = ref(false)
const toastOpen = ref(false)
const lastBooking = ref<Booking | null>(null)

function handleComplete(payload: Booking) {
  lastBooking.value = payload
  confirmedOpen.value = true
  window.setTimeout(() => {
    toastOpen.value = true
  }, 350)
}
</script>

<template>
  <main class="min-h-screen w-full relative overflow-hidden bg-brand-green-deep">
    <!-- Background image -->
    <div
      class="absolute inset-0 bg-cover bg-center"
      :style="{ backgroundImage: `url('/assets/bg-home.png')` }"
    />

    <!-- Gradient overlays for legibility -->
    <div
      class="absolute inset-0 pointer-events-none"
      :style="{
        background:
          'linear-gradient(180deg, rgba(0,40,28,0.15) 0%, rgba(0,40,28,0.35) 45%, rgba(0,40,28,0.85) 78%, rgba(0,27,12,0.96) 100%)',
      }"
    />
    <div
      class="absolute inset-0 pointer-events-none"
      :style="{
        background:
          'linear-gradient(90deg, rgba(0,30,22,0.55) 0%, rgba(0,30,22,0.15) 45%, rgba(0,30,22,0) 65%)',
      }"
    />

    <!-- Theme toggle -->
    <div class="absolute top-5 right-5 sm:top-6 sm:right-8 z-20">
      <ThemeToggle />
    </div>

    <!-- Content -->
    <div class="relative z-10 min-h-screen flex flex-col px-5 sm:px-10 lg:px-16 py-8 sm:py-10">
      <!-- Top spacer -->
      <div class="flex-1 min-h-[120px]" />

      <!-- Hero -->
      <motion.div
        :initial="{ opacity: 0, y: 24 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }"
        class="grid grid-cols-1 md:grid-cols-[1.15fr_1fr] gap-8 md:gap-12 items-end max-w-[1280px]"
      >
        <!-- Left: logo + heading + CTAs -->
        <div>
          <motion.img
            :initial="{ opacity: 0, y: -10 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }"
            src="/assets/logo.png"
            alt="Precision Garage Door Service"
            class="w-[170px] sm:w-[200px] lg:w-[220px] h-auto object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)] mb-5 sm:mb-6"
          />
          <h1
            class="font-display font-bold text-white text-[34px] sm:text-[44px] lg:text-[52px] xl:text-[60px] leading-[1.05] tracking-[-0.02em] max-w-[640px] lg:max-w-[760px] drop-shadow-[0_4px_18px_rgba(0,0,0,0.45)]"
          >
            Book a garage <br /> door appointment <br /> in seconds
          </h1>

          <motion.div
            :initial="{ opacity: 0, y: 12 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.5, delay: 0.4 }"
            class="mt-7 sm:mt-9 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4"
          >
            <Button
              @click="open = true"
              class="px-7 h-[52px] text-[15px] gap-2.5 rounded-[12px]"
            >
              <CalendarClock class="size-5" />
              Schedule an appointment
            </Button>
            <a
              href="tel:+18773017474"
              class="inline-flex items-center justify-center gap-2.5 h-[52px] px-6 rounded-[12px] text-[15px] font-semibold border-2 border-white/70 text-white bg-white/[0.04] hover:bg-white/[0.12] hover:border-white transition-colors backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E7D2AD]"
            >
              <Phone class="size-[18px]" stroke-width="2.4" />
              Call (877) 301-7474
            </a>
          </motion.div>
        </div>

        <!-- Right: description -->
        <motion.div
          :initial="{ opacity: 0, y: 18 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.6, delay: 0.5 }"
          class="md:pb-2"
        >
          <p class="text-white/90 text-[17px] sm:text-[19px] lg:text-[20px] leading-[1.55] max-w-[540px]">
            <span class="text-white font-semibold">
              At Precision Garage Door Service®, we fix garage doors right!
            </span>
            Our technicians are professionally trained by the best in the industry and use
            only high-quality parts to keep your garage door running smoothly for years to
            come.
          </p>
        </motion.div>
      </motion.div>

    </div>

    <AppointmentScheduler v-model:open="open" @complete="handleComplete" />
    <BookingConfirmedModal v-model:open="confirmedOpen" :booking="lastBooking" />
    <Toast
      v-model:open="toastOpen"
      title="Booking confirmed"
      description="We sent the details to your email — please check your inbox."
    />
  </main>
</template>
