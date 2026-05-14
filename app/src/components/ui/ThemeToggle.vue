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
      'group relative inline-flex items-center gap-2 rounded-full text-xs font-medium select-none transition-colors duration-300',
      'h-9 pl-1 pr-3.5 border backdrop-blur',
      theme === 'dark'
        ? 'bg-white/5 border-white/15 text-white/85 hover:bg-white/10'
        : 'bg-black/5 border-black/10 text-brand-green hover:bg-black/10',
    ]"
    :aria-pressed="theme === 'light'"
    aria-label="Toggle theme"
    @click="toggle"
  >
    <span
      class="relative inline-flex items-center justify-between w-12 h-7 rounded-full overflow-hidden border"
      :class="theme === 'dark' ? 'border-white/15 bg-black/30' : 'border-black/10 bg-white'"
    >
      <Sun
        class="size-3.5 ml-1.5 transition-colors"
        :class="theme === 'light' ? 'text-amber-500' : 'text-white/40'"
        stroke-width="2.5"
      />
      <Moon
        class="size-3.5 mr-1.5 transition-colors"
        :class="theme === 'dark' ? 'text-brand-mint' : 'text-black/30'"
        stroke-width="2.5"
      />
      <motion.span
        :animate="{ x: theme === 'dark' ? 24 : 0 }"
        :transition="{ type: 'spring', stiffness: 400, damping: 30 }"
        class="absolute top-0.5 left-0.5 size-6 rounded-full shadow-md"
        :class="theme === 'dark' ? 'bg-brand-mint' : 'bg-brand-green'"
      />
    </span>
    <span class="font-display font-semibold tracking-tight">
      {{ theme === "dark" ? "Dark" : "Light" }}
    </span>
  </button>
</template>
