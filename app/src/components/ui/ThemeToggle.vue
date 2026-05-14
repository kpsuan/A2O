<script setup lang="ts">
import { motion } from "motion-v"
import { Moon, Sun } from "lucide-vue-next"
import { useTheme } from "@/lib/theme"

const theme = useTheme()

function toggle() {
  theme.value = theme.value === "dark" ? "light" : "dark"
}
</script>

<template>
  <button
    type="button"
    :class="[
      'group relative inline-flex items-center gap-3 rounded-full text-[15px] font-semibold select-none transition-colors duration-300',
      'h-14 pl-1.5 pr-5 border-2 backdrop-blur shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)]',
      theme === 'dark'
        ? 'bg-white/10 border-white/30 text-white hover:bg-white/15'
        : 'bg-white/90 border-brand-green/30 text-brand-green hover:bg-white',
    ]"
    :aria-pressed="theme === 'light'"
    aria-label="Toggle theme"
    @click="toggle"
  >
    <span
      class="relative inline-flex items-center justify-between w-[72px] h-11 rounded-full overflow-hidden border-2"
      :class="theme === 'dark' ? 'border-white/20 bg-black/40' : 'border-brand-green/15 bg-white'"
    >
      <Sun
        class="size-[18px] ml-2.5 transition-colors"
        :class="theme === 'light' ? 'text-amber-500' : 'text-white/40'"
        stroke-width="2.5"
      />
      <Moon
        class="size-[18px] mr-2.5 transition-colors"
        :class="theme === 'dark' ? 'text-brand-mint' : 'text-black/30'"
        stroke-width="2.5"
      />
      <motion.span
        :animate="{ x: theme === 'dark' ? 32 : 0 }"
        :transition="{ type: 'spring', stiffness: 400, damping: 30 }"
        class="absolute top-1 left-1 size-9 rounded-full shadow-md grid place-items-center"
        :class="theme === 'dark' ? 'bg-brand-mint' : 'bg-brand-green'"
      >
        <component
          :is="theme === 'dark' ? Moon : Sun"
          class="size-4"
          :class="theme === 'dark' ? 'text-brand-green' : 'text-[#E7D2AD]'"
          stroke-width="2.75"
        />
      </motion.span>
    </span>
    <span class="font-display font-semibold tracking-tight">
      {{ theme === "dark" ? "Dark mode" : "Light mode" }}
    </span>
  </button>
</template>
