<script setup lang="ts">
import { ref, computed, watch } from "vue"
import { motion, AnimatePresence } from "motion-v"
import { X, ShieldCheck, Star } from "lucide-vue-next"
import { useEventListener } from "@vueuse/core"
import { CalendarDate, getLocalTimeZone, today } from "@internationalized/date"
import { useThemeFlags } from "@/lib/theme"
import { urgencyForDate } from "@/lib/availability"
import Button from "@/components/ui/Button.vue"
import Calendar from "@/components/ui/Calendar.vue"
import Stepper from "./Stepper.vue"
import ServiceCard from "./ServiceCard.vue"
import LocationStep from "./LocationStep.vue"
import TimeSlotsPanel from "./TimeSlotsPanel.vue"

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{
  (e: "update:open", value: boolean): void
  (
    e: "complete",
    payload: {
      serviceId: string
      zip: string
      date: string
      slot: string
    }
  ): void
}>()

const { isLight, isDark } = useThemeFlags()

const services = [
  { id: "repairs", title: "Garage Door & Open Repairs", image: "/assets/service-repairs.png" },
  { id: "new-door", title: "New Garage Door", image: "/assets/service-new-door.png" },
  { id: "opener", title: "New Garage Door Opener", image: "/assets/service-opener.png" },
]

const trustBadges = [
  "Licensed & insured",
  "5-year warranty",
  "No charge to book",
  "Background-checked techs",
]

const step = ref(1)
const totalSteps = 3
const selectedService = ref<string | null>(null)
const zip = ref("")
const zipValid = ref(false)
const primaryState = ref<"default" | "loading" | "success">("default")

const _todayDate = today(getLocalTimeZone())
const rangeStart = ref<CalendarDate>(_todayDate)
const selectedDate = ref<CalendarDate>(_todayDate)
const selectedSlot = ref<{ date: string; slot: string } | null>(null)

const subtitle = computed(() => {
  switch (step.value) {
    case 1:
      return "How can we help"
    case 2:
      return "Where are you located?"
    case 3:
      return "Pick a time that works"
    default:
      return ""
  }
})

const primaryLabel = computed(() => {
  switch (step.value) {
    case 1:
      return "Next"
    case 2:
      return "See Available Times"
    case 3:
      return "Confirm Booking"
    default:
      return "Next"
  }
})

const secondaryLabel = computed(() => (step.value === 1 ? "Cancel" : "Go Back"))

const canAdvance = computed(() => {
  if (step.value === 1) return selectedService.value !== null
  if (step.value === 2) return zipValid.value
  if (step.value === 3) return selectedSlot.value !== null
  return true
})

const progressPct = computed(() => (step.value / totalSteps) * 100)

function close() {
  emit("update:open", false)
}

function reset() {
  step.value = 1
  selectedService.value = null
  zip.value = ""
  zipValid.value = false
  primaryState.value = "default"
  rangeStart.value = today(getLocalTimeZone())
  selectedDate.value = today(getLocalTimeZone())
  selectedSlot.value = null
}

function onCalendarSelect(d: CalendarDate) {
  selectedDate.value = d
}

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms))
}

async function primaryAction() {
  if (!canAdvance.value || primaryState.value !== "default") return

  if (step.value === 1) {
    step.value += 1
    return
  }

  primaryState.value = "loading"
  await delay(900)
  primaryState.value = "success"
  await delay(650)

  if (step.value < totalSteps) {
    step.value += 1
    primaryState.value = "default"
  } else {
    emit("complete", {
      serviceId: selectedService.value!,
      zip: zip.value,
      date: selectedSlot.value!.date,
      slot: selectedSlot.value!.slot,
    })
    close()
  }
}

function secondaryAction() {
  if (primaryState.value !== "default") return
  if (step.value === 1) {
    close()
  } else {
    step.value -= 1
  }
}

watch(
  () => props.open,
  (v) => {
    if (v) reset()
  }
)

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
      class="fixed inset-0 z-50 flex items-center justify-center sm:p-4 md:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scheduler-title"
    >
      <motion.div
        class="absolute inset-0 bg-black/70 backdrop-blur-sm"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
        @click="close"
      />

      <motion.div
        :initial="{ opacity: 0, scale: 0.95, y: 16 }"
        :animate="{ opacity: 1, scale: 1, y: 0 }"
        :exit="{ opacity: 0, scale: 0.96, y: 8 }"
        :transition="{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }"
        :class="[
          'relative w-full max-w-[1280px] sm:aspect-[1280/846] h-[100dvh] sm:h-auto sm:max-h-[92vh] overflow-hidden sm:rounded-[28px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] flex flex-col',
          isLight ? 'bg-white text-[#0d2e22]' : 'bg-brand-green text-white',
        ]"
        :style="
          isDark
            ? {
                backgroundImage: `url('/assets/watermark.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        "
      >
        <!-- Dark mode vignette -->
        <div
          v-if="isDark"
          class="pointer-events-none absolute inset-0"
          :style="{ background: 'radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,0.06), transparent 60%), linear-gradient(180deg, rgba(0,82,61,0.55) 0%, rgba(0,82,61,0.15) 30%, rgba(0,82,61,0) 60%)' }"
        />

        <div class="relative flex-1 flex flex-col min-h-0">
          <!-- HEADER BAND (always dark green) -->
          <div
            :class="[
              'relative px-4 sm:px-[5%] pt-5 sm:pt-6 pb-4 sm:pb-5',
              isLight ? 'bg-brand-green text-white' : '',
            ]"
            :style="
              isLight
                ? {
                    backgroundImage: `url('/assets/watermark.png')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: '#00523d',
                    boxShadow: '0 4px 33.6px 34px rgba(0, 0, 0, 0.25)',
                  }
                : undefined
            "
          >
            <!-- soft tint over light-mode header bg image -->
            <div
              v-if="isLight"
              class="pointer-events-none absolute inset-0"
              :style="{ background: 'linear-gradient(180deg, rgba(0,82,61,0.6) 0%, rgba(0,82,61,0.3) 60%, rgba(0,82,61,0.65) 100%)' }"
            />

            <motion.div
              :initial="{ opacity: 0, x: -12 }"
              :animate="{ opacity: 1, x: 0 }"
              :transition="{ duration: 0.5, delay: 0.1 }"
              class="absolute left-4 sm:left-[5%] top-4 sm:top-6 w-[68px] h-[56px] sm:w-[122px] sm:h-[100px] z-10"
            >
              <img src="/assets/logo.png" alt="Precision Garage Door Service" class="size-full object-contain" />
            </motion.div>

            <motion.button
              type="button"
              :initial="{ opacity: 0, rotate: -90 }"
              :animate="{ opacity: 1, rotate: 0 }"
              :transition="{ duration: 0.5, delay: 0.2 }"
              :while-hover="{ scale: 1.1, rotate: 90 }"
              :while-tap="{ scale: 0.9 }"
              class="absolute right-4 sm:right-5 top-4 sm:top-5 z-10 grid place-items-center text-white/75 hover:text-white transition-colors"
              @click="close"
              aria-label="Close"
            >
              <X class="size-6" stroke-width="2" />
            </motion.button>

            <div class="relative z-10 text-center pt-12 sm:pt-4">
              <motion.h2
                id="scheduler-title"
                :initial="{ opacity: 0, y: -8 }"
                :animate="{ opacity: 1, y: 0 }"
                :transition="{ duration: 0.5, delay: 0.15 }"
                :class="[
                  'font-display text-[14px] sm:text-[18px] leading-tight tracking-[-0.01em] text-white/85',
                  isLight ? 'font-medium' : 'font-semibold',
                ]"
              >
                Appointment Scheduler
              </motion.h2>

              <AnimatePresence mode="wait">
                <motion.p
                  :key="subtitle"
                  :initial="{ opacity: 0, y: -6 }"
                  :animate="{ opacity: 1, y: 0 }"
                  :exit="{ opacity: 0, y: 6 }"
                  :transition="{ duration: 0.3 }"
                  :class="[
                    'font-display text-[22px] sm:text-[30px] text-white leading-tight tracking-[-0.02em] mt-1',
                    isLight ? 'font-medium' : 'font-bold',
                  ]"
                >
                  {{ subtitle }}
                </motion.p>
              </AnimatePresence>

              <motion.div
                :initial="{ opacity: 0, y: -4 }"
                :animate="{ opacity: 1, y: 0 }"
                :transition="{ duration: 0.4, delay: 0.3 }"
                class="mt-2 inline-flex items-center gap-1.5 text-[12px] sm:text-[13px] text-white/70"
              >
                <Star class="size-3.5 text-brand-mint fill-brand-mint" stroke-width="2" />
                <span class="font-semibold text-white">4.9</span>
                <span class="text-white/55">·</span>
                <span>12,000+ homeowners</span>
              </motion.div>
            </div>

            <!-- Stepper (dark mode only — visible chips) -->
            <div v-if="isDark" class="relative z-10 mt-5 sm:mt-7 px-2 sm:px-[15%]">
              <Stepper :current="step" :total="totalSteps" />
            </div>
          </div>

          <!-- Progress bar (light mode replacement for circle stepper) -->
          <div
            v-if="isLight"
            class="relative h-[3px] bg-[#e7eae8] overflow-hidden"
          >
            <motion.div
              :initial="{ width: '0%' }"
              :animate="{ width: `${progressPct}%` }"
              :transition="{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }"
              class="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-mint via-brand-mint to-brand-mint-soft"
              :style="{ boxShadow: '0 0 12px rgba(86, 255, 163, 0.6)' }"
            />
          </div>

          <!-- BODY -->
          <div
            :class="[
              'relative flex-1 min-h-0 flex items-stretch justify-center px-4 sm:px-[5%] pt-6 sm:pt-8 pb-6 overflow-y-auto',
              isLight ? 'bg-white text-[#0d2e22]' : '',
            ]"
            :style="
              isLight
                ? { backgroundImage: 'linear-gradient(180deg, rgba(247,250,248,1) 0%, rgba(255,255,255,1) 100%)' }
                : undefined
            "
          >
            <AnimatePresence mode="wait">
              <!-- Step 1 -->
              <motion.div
                v-if="step === 1"
                key="step-1"
                :initial="{ opacity: 0, x: 30 }"
                :animate="{ opacity: 1, x: 0 }"
                :exit="{ opacity: 0, x: -30 }"
                :transition="{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }"
                class="w-full flex flex-col items-center justify-between gap-7 min-h-full"
              >
                <motion.div
                  :initial="{ opacity: 0, y: -6 }"
                  :animate="{ opacity: 1, y: 0 }"
                  :transition="{ delay: 0.2, duration: 0.4 }"
                  class="text-center"
                >
                  <h3
                    :class="[
                      'font-display font-semibold text-[22px] leading-tight tracking-[-0.01em]',
                      isLight ? 'text-[#0d2e22]' : 'text-white',
                    ]"
                  >
                    Select a service
                  </h3>
                  <p :class="['text-sm mt-1', isLight ? 'text-[#0d2e22]/60' : 'text-white/60']">
                    Choose the option that best matches what you need.
                  </p>
                </motion.div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-[40px] w-full max-w-[920px] justify-items-center">
                  <ServiceCard
                    v-for="(svc, i) in services"
                    :key="svc.id"
                    :title="svc.title"
                    :image="svc.image"
                    :index="i"
                    :selected="selectedService === svc.id"
                    :any-selected="selectedService !== null"
                    @select="selectedService = selectedService === svc.id ? null : svc.id"
                  />
                </div>

                <motion.div
                  :initial="{ opacity: 0, y: 10 }"
                  :animate="{ opacity: 1, y: 0 }"
                  :transition="{ delay: 0.6, duration: 0.4 }"
                  class="flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-10 gap-y-3 pt-2"
                >
                  <motion.div
                    v-for="(badge, i) in trustBadges"
                    :key="badge"
                    :initial="{ opacity: 0, y: 8 }"
                    :animate="{ opacity: 1, y: 0 }"
                    :transition="{ delay: 0.7 + i * 0.06, duration: 0.35 }"
                    :class="[
                      'flex items-center gap-3',
                      isLight ? 'text-[#0d2e22]' : 'text-white',
                    ]"
                  >
                    <span
                      :class="[
                        'grid place-items-center size-7 rounded-md',
                        isLight
                          ? 'bg-brand-mint/15 ring-1 ring-brand-mint/40'
                          : 'bg-[rgba(233,255,243,0.1)]',
                      ]"
                    >
                      <ShieldCheck
                        :class="['size-4', isLight ? 'text-brand-green' : 'text-brand-mint']"
                        stroke-width="2.5"
                      />
                    </span>
                    <span class="font-sans font-semibold text-[14px] leading-5">{{ badge }}</span>
                  </motion.div>
                </motion.div>
              </motion.div>

              <!-- Step 2 -->
              <motion.div
                v-else-if="step === 2"
                key="step-2"
                :initial="{ opacity: 0, x: 30 }"
                :animate="{ opacity: 1, x: 0 }"
                :exit="{ opacity: 0, x: -30 }"
                :transition="{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }"
                class="w-full flex items-center justify-center min-h-full pt-2"
              >
                <LocationStep v-model="zip" @update:valid="zipValid = $event" />
              </motion.div>

              <!-- Step 3 -->
              <motion.div
                v-else
                key="step-3"
                :initial="{ opacity: 0, x: 30 }"
                :animate="{ opacity: 1, x: 0 }"
                :exit="{ opacity: 0, x: -30 }"
                :transition="{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }"
                class="w-full max-w-[1040px] mx-auto flex flex-col justify-start md:justify-center min-h-full"
              >
                <div class="grid grid-cols-1 md:grid-cols-[1fr_1.15fr] gap-6 md:gap-8 lg:gap-10">
                  <!-- Left: Calendar -->
                  <motion.div
                    :initial="{ opacity: 0, x: -16 }"
                    :animate="{ opacity: 1, x: 0 }"
                    :transition="{ delay: 0.15, duration: 0.4 }"
                    :class="[
                      'rounded-2xl p-5 self-start',
                      isLight
                        ? 'border border-black/8 bg-[#f7faf8]'
                        : 'border border-white/10 bg-white/[0.04] backdrop-blur-[2px]',
                    ]"
                  >
                    <Calendar
                      :model-value="selectedDate"
                      :urgency-for-date="urgencyForDate"
                      @update:model-value="onCalendarSelect"
                    />
                    <div
                      :class="[
                        'mt-3 pt-3 flex items-center gap-2 text-[12px]',
                        isLight
                          ? 'border-t border-black/8 text-[#0d2e22]/60'
                          : 'border-t border-white/10 text-white/60',
                      ]"
                    >
                      <span
                        class="inline-block size-2 rounded-full"
                        :class="isLight ? 'bg-brand-green' : 'bg-brand-mint'"
                      />
                      Selected · click any day to load its times
                    </div>
                  </motion.div>

                  <!-- Right: Time slots -->
                  <motion.div
                    :initial="{ opacity: 0, x: 16 }"
                    :animate="{ opacity: 1, x: 0 }"
                    :transition="{ delay: 0.2, duration: 0.4 }"
                    class="flex flex-col"
                  >
                    <div class="mb-4 flex items-center justify-between">
                      <h3
                        :class="[
                          'font-display font-semibold text-[18px] tracking-[-0.01em]',
                          isLight ? 'text-[#0d2e22]' : 'text-white',
                        ]"
                      >
                        Available appointments
                      </h3>
                      <span
                        :class="[
                          'text-[11px] font-medium uppercase tracking-[0.08em]',
                          isLight ? 'text-[#0d2e22]/50' : 'text-white/55',
                        ]"
                      >
                        2-hour windows
                      </span>
                    </div>
                    <TimeSlotsPanel
                      :start-date="rangeStart"
                      :focus-date="selectedDate"
                      :selected="selectedSlot"
                      @select="selectedSlot = $event"
                    />
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <!-- FOOTER -->
          <div
            :class="[
              'relative px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-end gap-2 sm:gap-3',
              isLight
                ? 'bg-white border-t border-black/8'
                : 'border-t border-brand-mint-soft/70',
            ]"
          >
            <Button
              variant="outline"
              :disabled="primaryState !== 'default'"
              class="flex-1 sm:flex-none"
              @click="secondaryAction"
            >
              {{ secondaryLabel }}
            </Button>
            <motion.div
              :animate="canAdvance && primaryState === 'default' ? { scale: [1, 1.02, 1] } : {}"
              :transition="{ duration: 0.4 }"
              class="flex-1 sm:flex-none"
            >
              <Button
                :disabled="!canAdvance"
                :state="primaryState"
                class="w-full sm:w-auto sm:min-w-[180px]"
                @click="primaryAction"
              >
                {{ primaryLabel }}
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
</template>
