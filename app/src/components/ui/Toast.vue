<script setup lang="ts">
import { watch, ref } from "vue"
import { motion, AnimatePresence } from "motion-v"
import { CheckCircle2, Mail, X } from "lucide-vue-next"
import { useThemeFlags } from "@/lib/theme"

const props = withDefaults(
  defineProps<{
    open: boolean
    title?: string
    description?: string
    duration?: number
  }>(),
  { duration: 5000, title: "Booking confirmed", description: "Check your email for the details." }
)

const emit = defineEmits<{
  (e: "update:open", value: boolean): void
}>()

const { isLight } = useThemeFlags()

const progress = ref(100)
let timer: number | null = null
let raf: number | null = null

function start() {
  cancel()
  const startedAt = performance.now()
  const tick = () => {
    const elapsed = performance.now() - startedAt
    progress.value = Math.max(0, 100 - (elapsed / props.duration) * 100)
    if (elapsed >= props.duration) {
      emit("update:open", false)
      return
    }
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
  timer = window.setTimeout(() => emit("update:open", false), props.duration)
}

function cancel() {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  if (raf) {
    cancelAnimationFrame(raf)
    raf = null
  }
}

watch(
  () => props.open,
  (v) => {
    if (v) {
      progress.value = 100
      start()
    } else {
      cancel()
    }
  },
  { immediate: true }
)
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed top-4 sm:top-6 right-4 sm:right-6 z-[100] pointer-events-none flex flex-col gap-3 max-w-[calc(100vw-2rem)] sm:max-w-[380px]"
      aria-live="polite"
    >
      <AnimatePresence>
        <motion.div
          v-if="open"
          :initial="{ opacity: 0, x: 40, scale: 0.95 }"
          :animate="{ opacity: 1, x: 0, scale: 1 }"
          :exit="{ opacity: 0, x: 40, scale: 0.95 }"
          :transition="{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }"
          :class="[
            'pointer-events-auto relative overflow-hidden rounded-2xl backdrop-blur-lg p-4 pr-12 flex items-start gap-3',
            isLight
              ? 'bg-white/95 border border-black/8 text-[#0d2e22] shadow-[0_24px_60px_-20px_rgba(0,82,61,0.35)]'
              : 'bg-[#003323]/95 border border-brand-mint/30 text-white shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)]',
          ]"
          role="status"
          @mouseenter="cancel"
          @mouseleave="open && start()"
        >
          <motion.div
            :initial="{ scale: 0, rotate: -90 }"
            :animate="{ scale: 1, rotate: 0 }"
            :transition="{ delay: 0.1, duration: 0.4, type: 'spring', stiffness: 220, damping: 18 }"
            :class="[
              'shrink-0 grid place-items-center size-10 rounded-full ring-1',
              isLight ? 'bg-brand-mint/20 ring-brand-green/40' : 'bg-brand-mint/15 ring-brand-mint/40',
            ]"
          >
            <CheckCircle2
              :class="['size-6', isLight ? 'text-brand-green' : 'text-brand-mint']"
              stroke-width="2.4"
            />
          </motion.div>

          <div class="flex flex-col gap-1 pt-0.5">
            <p class="font-display font-bold text-[15px] tracking-[-0.01em]">{{ title }}</p>
            <p
              :class="[
                'text-[13px] leading-snug inline-flex items-center gap-1.5',
                isLight ? 'text-[#0d2e22]/70' : 'text-white/75',
              ]"
            >
              <Mail :class="['size-3.5', isLight ? 'text-brand-green' : 'text-brand-mint']" />
              {{ description }}
            </p>
          </div>

          <button
            type="button"
            :class="[
              'absolute top-3 right-3 size-7 grid place-items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2',
              isLight
                ? 'text-[#0d2e22]/50 hover:text-[#0d2e22] hover:bg-black/5 focus-visible:ring-brand-green'
                : 'text-white/60 hover:text-white hover:bg-white/10 focus-visible:ring-brand-mint',
            ]"
            aria-label="Dismiss"
            @click="emit('update:open', false)"
          >
            <X class="size-4" />
          </button>

          <div
            :class="[
              'absolute bottom-0 left-0 right-0 h-[3px]',
              isLight ? 'bg-black/8' : 'bg-white/10',
            ]"
          >
            <div
              :class="[
                'h-full transition-[width] duration-100 ease-linear',
                isLight ? 'bg-brand-green' : 'bg-brand-mint',
              ]"
              :style="{ width: `${progress}%` }"
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  </Teleport>
</template>
