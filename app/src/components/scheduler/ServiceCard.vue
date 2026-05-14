<script setup lang="ts">
import { motion } from "motion-v"
import { Check } from "lucide-vue-next"

defineProps<{
  title: string
  image: string
  selected: boolean
  anySelected?: boolean
  index: number
}>()

const emit = defineEmits<{ (e: "select"): void }>()
</script>

<template>
  <motion.button
    type="button"
    :initial="{ opacity: 0, y: 16 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ delay: 0.2 + index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }"
    @click="emit('select')"
    :class="[
      'group relative w-full max-w-[259px] h-[180px] sm:h-auto sm:aspect-square rounded-3xl overflow-hidden text-left outline-none card-shadow',
      'transition-[box-shadow,border-color,opacity,filter] duration-300',
      selected
        ? 'ring-2 ring-brand-mint'
        : 'ring-1 ring-white/15 hover:ring-white/40',
      anySelected && !selected ? 'opacity-30 grayscale brightness-75' : '',
    ]"
  >
    <div class="absolute inset-0">
      <img
        :src="image"
        :alt="title"
        class="absolute inset-0 size-full object-cover"
      />
    </div>

    <transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0 scale-90"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-90"
    >
      <div
        v-if="selected"
        class="absolute top-3 right-3 size-8 rounded-full bg-brand-mint flex items-center justify-center text-brand-green shadow-md shadow-black/30"
      >
        <Check class="size-4" stroke-width="3" />
      </div>
    </transition>

    <div class="absolute inset-x-0 bottom-0 p-4 sm:p-5 pb-5 sm:pb-6">
      <p
        class="font-display font-bold text-[18px] sm:text-[20px] text-center text-white leading-tight tracking-[-0.02em]"
      >
        {{ title }}
      </p>
    </div>
  </motion.button>
</template>
