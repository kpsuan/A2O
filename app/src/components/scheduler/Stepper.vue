<script setup lang="ts">
import { computed } from "vue"
import { motion } from "motion-v"
import { Check } from "lucide-vue-next"

const props = defineProps<{ current: number; total?: number }>()
const total = computed(() => props.total ?? 3)
const steps = computed(() => Array.from({ length: total.value }, (_, i) => i + 1))
const INFINITY = Number.POSITIVE_INFINITY
</script>

<template>
  <div class="flex items-center justify-center gap-2 w-full max-w-[640px] mx-auto select-none">
    <template v-for="(step, idx) in steps" :key="step">
      <motion.div
        :initial="{ opacity: 0, y: -8, scale: 0.9 }"
        :animate="{ opacity: 1, y: 0, scale: 1 }"
        :transition="{ delay: idx * 0.08 + 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] }"
        class="relative"
      >
        <div
          :class="[
            'relative size-10 rounded-full flex items-center justify-center text-[13px] font-semibold transition-colors duration-300',
            step === current
              ? 'bg-white text-brand-green ring-soft-glow'
              : step < current
                ? 'bg-brand-mint text-brand-green'
                : 'bg-brand-green-deep text-white/70 border border-white/15',
          ]"
        >
          <transition
            enter-active-class="transition duration-200"
            enter-from-class="opacity-0 scale-50"
            enter-to-class="opacity-100 scale-100"
            mode="out-in"
          >
            <Check v-if="step < current" :key="`c-${step}`" class="size-4" stroke-width="3" />
            <span v-else :key="`n-${step}`">{{ step }}</span>
          </transition>
        </div>
        <motion.span
          v-if="step === current"
          class="absolute -inset-1 rounded-full border border-brand-mint/40"
          :animate="{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }"
          :transition="{ duration: 2.4, repeat: INFINITY, ease: 'easeInOut' }"
        />
      </motion.div>
      <div
        v-if="idx < total - 1"
        class="flex-1 h-[2px] dashed-track relative overflow-hidden"
      >
        <motion.div
          v-if="step < current"
          class="absolute inset-0 bg-brand-mint"
          :initial="{ scaleX: 0, transformOrigin: 'left' }"
          :animate="{ scaleX: 1 }"
          :transition="{ duration: 0.45, ease: 'easeOut' }"
        />
      </div>
    </template>
  </div>
</template>
