<script setup lang="ts">
import { computed } from "vue"
import { motion, AnimatePresence } from "motion-v"
import { CheckCircle2, Clock, X, Wrench, MapPin, ArrowRight } from "lucide-vue-next"
import { useEventListener } from "@vueuse/core"
import { useThemeFlags } from "@/lib/theme"

const props = defineProps<{
  open: boolean
  booking: {
    serviceId: string
    zip: string
    date: string
    slot: string
  } | null
}>()

const emit = defineEmits<{
  (e: "update:open", value: boolean): void
}>()

const { isLight } = useThemeFlags()

const serviceLabels: Record<string, string> = {
  repairs: "Garage Door & Open Repairs",
  "new-door": "New Garage Door",
  opener: "New Garage Door Opener",
}

const todayLong = computed(() =>
  new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
)

const formattedDateShort = computed(() => {
  if (!props.booking?.date) return ""
  const [y, m, d] = props.booking.date.split("-").map(Number)
  const date = new Date(y, m - 1, d)
  return date
    .toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase()
})

const confirmationCode = computed(() => {
  if (!props.booking) return ""
  const seed =
    props.booking.serviceId.length * 31 +
    props.booking.zip.length * 17 +
    props.booking.date.length * 11 +
    props.booking.slot.length
  return `PG${((seed * 9301 + 49297) % 100000).toString().padStart(5, "0")}`
})

const slotParts = computed(() => {
  if (!props.booking?.slot) return { start: "", end: "" }
  const parts = props.booking.slot.split(/\s*[–-]\s*/).map((s) => s.trim())
  return { start: parts[0] || "", end: parts[1] || "" }
})

const heroTitle = "Your appointment is confirmed"
const heroBody =
  "Your technician has been scheduled. We'll text and email you a reminder the day before. If anything changes on our end, we'll reach out right away."

function close() {
  emit("update:open", false)
}

useEventListener("keydown", (e: KeyboardEvent) => {
  if (!props.open) return
  if (e.key === "Escape") close()
})
</script>

<template>
  <AnimatePresence>
    <motion.div
      v-if="open"
      :initial="{ opacity: 0 }"
      :animate="{ opacity: 1 }"
      :exit="{ opacity: 0 }"
      :transition="{ duration: 0.25 }"
      class="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <motion.div
        class="absolute inset-0 bg-black/70 backdrop-blur-sm"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
        @click="close"
      />

      <motion.div
        :initial="{ opacity: 0, scale: 0.95, y: 24 }"
        :animate="{ opacity: 1, scale: 1, y: 0 }"
        :exit="{ opacity: 0, scale: 0.96, y: 8 }"
        :transition="{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }"
        :class="[
          'relative w-full max-w-[460px] max-h-[92vh] overflow-hidden rounded-[20px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.55)] flex flex-col',
          isLight ? 'bg-[#eef1f3]' : 'bg-[#0b1f17]',
        ]"
      >
        <!-- HEADER BAND -->
        <div class="relative px-5 py-3.5 bg-brand-green flex items-center justify-between shrink-0">
          <motion.div
            :initial="{ opacity: 0, x: -8 }"
            :animate="{ opacity: 1, x: 0 }"
            :transition="{ delay: 0.15, duration: 0.4 }"
            class="flex items-center"
          >
            <img
              src="/assets/logo.png"
              alt="Precision Garage Door Service"
              class="h-9 w-auto object-contain"
            />
          </motion.div>

          <motion.div
            :initial="{ opacity: 0, x: 8 }"
            :animate="{ opacity: 1, x: 0 }"
            :transition="{ delay: 0.15, duration: 0.4 }"
            class="text-white/95 text-[12.5px] font-medium pr-8"
          >
            {{ todayLong }}
          </motion.div>

          <button
            type="button"
            class="absolute top-2.5 right-2.5 size-7 grid place-items-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-mint"
            aria-label="Close"
            @click="close"
          >
            <X class="size-4" />
          </button>
        </div>

        <!-- SCROLLABLE BODY -->
        <div class="flex-1 overflow-y-auto p-4 space-y-3.5">
          <!-- HERO CARD -->
          <motion.div
            :initial="{ opacity: 0, y: 10 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: 0.2, duration: 0.45 }"
            :class="[
              'relative rounded-[14px] px-5 pt-6 pb-6 text-center overflow-hidden',
              isLight ? 'border border-black/5' : 'border border-white/8',
            ]"
            :style="
              isLight
                ? {
                    background:
                      'linear-gradient(180deg, #e6efeb 0%, #d3e1d9 100%)',
                  }
                : {
                    background:
                      'linear-gradient(180deg, rgba(0,82,61,0.4) 0%, rgba(0,59,44,0.4) 100%)',
                  }
            "
          >
            <div
              class="absolute inset-0 pointer-events-none"
              :style="{
                backgroundImage: `url('/assets/watermark.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: isLight ? 0.12 : 0.18,
                mixBlendMode: isLight ? 'multiply' : 'screen',
              }"
            />

            <motion.div
              :initial="{ scale: 0.6, opacity: 0 }"
              :animate="{ scale: 1, opacity: 1 }"
              :transition="{ delay: 0.3, duration: 0.45, type: 'spring', stiffness: 200, damping: 16 }"
              :class="[
                'relative inline-grid place-items-center size-12 rounded-[10px] mb-3.5',
                isLight ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]' : 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.25)]',
              ]"
            >
              <CheckCircle2 class="size-6 text-brand-green" stroke-width="2.4" />
            </motion.div>

            <h2
              id="confirm-title"
              :class="[
                'relative font-display font-bold text-[20px] sm:text-[22px] tracking-[-0.01em] leading-tight',
                isLight ? 'text-[#0d2e22]' : 'text-white',
              ]"
            >
              {{ heroTitle }}
            </h2>
            <p
              :class="[
                'relative text-[12px] leading-[1.55] mt-2.5 max-w-[340px] mx-auto',
                isLight ? 'text-[#0d2e22]/65' : 'text-white/70',
              ]"
            >
              {{ heroBody }}
            </p>
          </motion.div>

          <!-- BOOKING ID + SUPPORT ROW -->
          <motion.div
            :initial="{ opacity: 0, y: 8 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: 0.3, duration: 0.4 }"
            class="flex items-center justify-between gap-3"
          >
            <div
              :class="[
                'flex items-center gap-2 rounded-[10px] px-3 py-2 shrink-0',
                isLight ? 'bg-white border border-black/8' : 'bg-white/5 border border-white/10',
              ]"
            >
              <Wrench
                :class="['size-3.5', isLight ? 'text-[#0d2e22]' : 'text-brand-mint']"
                stroke-width="2.4"
              />
              <span :class="['text-[12px]', isLight ? 'text-[#0d2e22]/70' : 'text-white/70']">
                Booking ID:
                <span :class="['font-semibold ml-0.5', isLight ? 'text-brand-green' : 'text-brand-mint']">
                  {{ confirmationCode }}
                </span>
              </span>
            </div>
            <button
              type="button"
              class="px-4 py-2 rounded-[10px] bg-brand-green hover:bg-brand-green-deep text-white text-[12.5px] font-semibold transition-colors shadow-[0_4px_14px_-4px_rgba(0,82,61,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-mint whitespace-nowrap"
            >
              Contact Support
            </button>
          </motion.div>

          <!-- APPOINTMENT DETAIL CARD -->
          <motion.div
            v-if="booking"
            :initial="{ opacity: 0, y: 10 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: 0.38, duration: 0.45 }"
            :class="[
              'rounded-[14px] p-4 shadow-[0_2px_10px_rgba(0,0,0,0.04)]',
              isLight ? 'bg-[#f3f5f6] border border-black/8' : 'bg-white/[0.04] border border-white/10',
            ]"
          >
            <!-- Card heading row -->
            <div
              :class="[
                'flex items-center justify-center gap-2.5 pb-3 border-b',
                isLight ? 'border-black/8' : 'border-white/10',
              ]"
            >
              <span :class="['text-[15px] font-bold', isLight ? 'text-[#0d2e22]' : 'text-white']">
                Appointment
              </span>
              <span :class="['text-[13px]', isLight ? 'text-[#0d2e22]/60' : 'text-white/55']">
                In-Home
              </span>
              <span
                :class="[
                  'inline-flex items-center gap-1 text-[13px]',
                  isLight ? 'text-[#0d2e22]/70' : 'text-white/70',
                ]"
              >
                <Clock class="size-3.5" stroke-width="2.4" />
                2-hour window
              </span>
            </div>

            <!-- Inner detail card -->
            <div
              :class="[
                'mt-3 rounded-[10px] p-3.5',
                isLight ? 'bg-white border border-black/5' : 'bg-black/20 border border-white/8',
              ]"
            >
              <div
                :class="[
                  'text-[11px] font-bold tracking-[0.06em] mb-2.5',
                  isLight ? 'text-brand-green' : 'text-brand-mint',
                ]"
              >
                {{ formattedDateShort }}
              </div>

              <div class="flex items-start justify-between gap-3 mb-3">
                <div class="flex items-start gap-2.5">
                  <div
                    :class="[
                      'grid place-items-center size-7 rounded-md mt-0.5 shrink-0',
                      isLight ? 'bg-brand-green/10' : 'bg-brand-mint/15',
                    ]"
                  >
                    <Wrench
                      :class="['size-3.5', isLight ? 'text-brand-green' : 'text-brand-mint']"
                      stroke-width="2.5"
                    />
                  </div>
                  <div>
                    <div
                      :class="[
                        'text-[14px] font-bold leading-tight',
                        isLight ? 'text-[#0d2e22]' : 'text-white',
                      ]"
                    >
                      Precision Technician
                    </div>
                    <div
                      :class="[
                        'text-[11.5px] mt-0.5',
                        isLight ? 'text-[#0d2e22]/55' : 'text-white/55',
                      ]"
                    >
                      {{ serviceLabels[booking.serviceId] ?? booking.serviceId }}
                    </div>
                  </div>
                </div>
                <div class="text-right shrink-0">
                  <div
                    :class="[
                      'text-[11px]',
                      isLight ? 'text-[#0d2e22]/55' : 'text-white/55',
                    ]"
                  >
                    Service Tier
                  </div>
                  <div
                    :class="[
                      'text-[13px] font-bold mt-0.5',
                      isLight ? 'text-[#0d2e22]' : 'text-white',
                    ]"
                  >
                    Standard
                  </div>
                </div>
              </div>

              <!-- Time row -->
              <div
                :class="[
                  'flex items-center justify-between gap-3 pt-3 border-t',
                  isLight ? 'border-black/6' : 'border-white/8',
                ]"
              >
                <div>
                  <div
                    :class="[
                      'text-[15px] font-bold leading-tight',
                      isLight ? 'text-[#0d2e22]' : 'text-white',
                    ]"
                  >
                    {{ slotParts.start || booking.slot }}
                  </div>
                  <div
                    :class="[
                      'text-[11px] mt-0.5',
                      isLight ? 'text-[#0d2e22]/55' : 'text-white/55',
                    ]"
                  >
                    Arrival start
                  </div>
                </div>

                <div class="flex-1 flex items-center justify-center gap-2 px-1">
                  <span
                    :class="[
                      'flex-1 h-px',
                      isLight ? 'bg-[#0d2e22]/15' : 'bg-white/15',
                    ]"
                  />
                  <ArrowRight
                    :class="['size-3.5', isLight ? 'text-brand-green' : 'text-brand-mint']"
                    stroke-width="2.5"
                  />
                  <span
                    :class="[
                      'flex-1 h-px',
                      isLight ? 'bg-[#0d2e22]/15' : 'bg-white/15',
                    ]"
                  />
                </div>

                <div class="text-right">
                  <div
                    :class="[
                      'text-[15px] font-bold leading-tight',
                      isLight ? 'text-[#0d2e22]' : 'text-white',
                    ]"
                  >
                    {{ slotParts.end || "—" }}
                  </div>
                  <div
                    :class="[
                      'text-[11px] mt-0.5',
                      isLight ? 'text-[#0d2e22]/55' : 'text-white/55',
                    ]"
                  >
                    Window ends
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <!-- SERVICE SUMMARY CARD -->
          <motion.div
            v-if="booking"
            :initial="{ opacity: 0, y: 10 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: 0.46, duration: 0.45 }"
            :class="[
              'rounded-[14px] p-4 shadow-[0_2px_10px_rgba(0,0,0,0.04)]',
              isLight ? 'bg-[#f3f5f6] border border-black/8' : 'bg-white/[0.04] border border-white/10',
            ]"
          >
            <div
              :class="[
                'text-center pb-3 border-b',
                isLight ? 'border-black/8' : 'border-white/10',
              ]"
            >
              <span
                :class="['text-[15px] font-bold', isLight ? 'text-[#0d2e22]' : 'text-white']"
              >
                Service Summary
              </span>
            </div>

            <div
              :class="[
                'text-[11px] font-bold tracking-[0.06em] mt-3 mb-2',
                isLight ? 'text-brand-green' : 'text-brand-mint',
              ]"
            >
              SERVICE AREA
            </div>

            <div class="flex items-center justify-between py-1.5 text-[13px]">
              <span
                :class="['inline-flex items-center gap-1.5', isLight ? 'text-[#0d2e22]/65' : 'text-white/65']"
              >
                <MapPin class="size-3.5" stroke-width="2.4" />
                Zip code
              </span>
              <span
                :class="['font-semibold font-mono', isLight ? 'text-[#0d2e22]' : 'text-white']"
              >
                {{ booking.zip }}
              </span>
            </div>

            <div class="flex items-center justify-between py-1.5 text-[13px]">
              <span :class="['', isLight ? 'text-[#0d2e22]/65' : 'text-white/65']">
                Service
              </span>
              <span
                :class="['font-semibold text-right', isLight ? 'text-[#0d2e22]' : 'text-white']"
              >
                {{ serviceLabels[booking.serviceId] ?? booking.serviceId }}
              </span>
            </div>

            <div class="flex items-center justify-between py-1.5 text-[13px]">
              <span :class="['', isLight ? 'text-[#0d2e22]/65' : 'text-white/65']">
                Confirmation
              </span>
              <span
                :class="['font-semibold font-mono', isLight ? 'text-brand-green' : 'text-brand-mint']"
              >
                {{ confirmationCode }}
              </span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
</template>
