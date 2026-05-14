<script setup lang="ts">
import { computed, ref, watch, nextTick } from "vue"
import { motion } from "motion-v"
import { CalendarDate, getLocalTimeZone } from "@internationalized/date"
import { Sun, Sunrise, Sunset, Flame } from "lucide-vue-next"
import { useThemeFlags } from "@/lib/theme"
import { slotsForDate, type Slot } from "@/lib/availability"

const props = defineProps<{
  startDate: CalendarDate
  focusDate: CalendarDate
  daysToShow?: number
  selected: { date: string; slot: string } | null
}>()

const emit = defineEmits<{
  (e: "select", value: { date: string; slot: string }): void
}>()

const { isLight } = useThemeFlags()

const periodIcon = {
  morning: Sunrise,
  afternoon: Sun,
  evening: Sunset,
}

const days = computed(() => {
  const count = props.daysToShow ?? 30
  const items: { date: CalendarDate; key: string; slots: Slot[] }[] = []
  for (let i = 0; i < count; i++) {
    const d = props.startDate.add({ days: i })
    items.push({ date: d, key: d.toString(), slots: slotsForDate(d) })
  }
  return items
})

const formatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: getLocalTimeZone(),
})

const tzAbbr = computed(() => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZoneName: "short",
    timeZone: getLocalTimeZone(),
  }).formatToParts(new Date())
  return parts.find((p) => p.type === "timeZoneName")?.value ?? ""
})

function fmt(d: CalendarDate) {
  return formatter.format(d.toDate(getLocalTimeZone()))
}

function isSelected(dateKey: string, slot: string) {
  return props.selected?.date === dateKey && props.selected?.slot === slot
}

const scrollContainer = ref<HTMLElement | null>(null)
const dayRefs = ref<Record<string, HTMLElement | null>>({})

function setDayRef(key: string) {
  return (el: Element | null) => {
    dayRefs.value[key] = el as HTMLElement | null
  }
}

watch(
  () => props.focusDate?.toString(),
  async (key) => {
    if (!key) return
    await nextTick()
    const target = dayRefs.value[key]
    const container = scrollContainer.value
    if (!target || !container) return
    const top = target.offsetTop - container.offsetTop - 4
    container.scrollTo({ top, behavior: "smooth" })
  },
  { immediate: false }
)

const headerBgStyle = computed(() => ({
  background: isLight.value
    ? "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.88) 70%, rgba(255,255,255,0) 100%)"
    : "linear-gradient(180deg, rgba(0,82,61,0.96) 0%, rgba(0,82,61,0.88) 70%, rgba(0,82,61,0) 100%)",
}))

const topFadeStyle = computed(() => ({
  background: isLight.value
    ? "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 100%)"
    : "linear-gradient(180deg, rgba(0,82,61,0.95) 0%, rgba(0,82,61,0) 100%)",
}))

const bottomFadeStyle = computed(() => ({
  background: isLight.value
    ? "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.95) 100%)"
    : "linear-gradient(180deg, rgba(0,82,61,0) 0%, rgba(0,82,61,0.95) 100%)",
}))
</script>

<template>
  <div class="relative h-full">
    <div
      ref="scrollContainer"
      class="flex flex-col gap-5 pr-3 max-h-[360px] overflow-y-auto custom-scroll scroll-smooth"
      :class="isLight && 'is-light'"
    >
      <div
        v-for="(d, dIdx) in days"
        :key="d.key"
        :ref="setDayRef(d.key)"
        class="flex flex-col gap-3"
      >
        <motion.div
          :initial="{ opacity: 0, x: -8 }"
          :animate="{ opacity: 1, x: 0 }"
          :transition="{ delay: Math.min(dIdx, 6) * 0.05, duration: 0.3 }"
          class="flex items-baseline gap-2 sticky top-0 z-10 -mx-1 px-1 py-1.5"
          :style="headerBgStyle"
        >
          <h4
            class="font-display font-bold text-[17px] tracking-[-0.01em]"
            :class="
              focusDate.toString() === d.key
                ? isLight
                  ? 'text-brand-green'
                  : 'text-brand-mint'
                : isLight
                  ? 'text-[#0d2e22]'
                  : 'text-white'
            "
          >
            {{ fmt(d.date) }}
          </h4>
          <span
            class="text-[11px] font-medium"
            :class="isLight ? 'text-[#0d2e22]/45' : 'text-white/50'"
          >
            ({{ tzAbbr }})
          </span>
          <span
            v-if="focusDate.toString() === d.key"
            class="ml-1 inline-block size-1.5 rounded-full"
            :class="isLight ? 'bg-brand-green' : 'bg-brand-mint'"
            aria-hidden="true"
          />
          <span
            v-if="d.slots.length > 0 && d.slots.length <= 2"
            class="ml-auto inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#003323] bg-[#E7D2AD] shadow-[0_4px_14px_-4px_rgba(231,210,173,0.55)] ring-1 ring-[#c9b489]/50"
          >
            <Flame class="size-3" stroke-width="2.75" />
            Only {{ d.slots.length }} spot{{ d.slots.length === 1 ? '' : 's' }} left
          </span>
        </motion.div>

        <div
          v-if="d.slots.length === 0"
          class="text-sm italic px-1"
          :class="isLight ? 'text-[#0d2e22]/45' : 'text-white/45'"
        >
          No availability — try another day.
        </div>

        <div v-else class="flex flex-wrap gap-2">
          <motion.button
            v-for="(slot, sIdx) in d.slots"
            :key="slot.label"
            type="button"
            :initial="{ opacity: 0, scale: 0.92, y: 4 }"
            :animate="{ opacity: 1, scale: 1, y: 0 }"
            :transition="{ delay: Math.min(dIdx, 6) * 0.05 + sIdx * 0.03, duration: 0.28, ease: [0.22, 1, 0.36, 1] }"
            :while-hover="{ y: -2 }"
            :while-tap="{ scale: 0.97 }"
            :class="[
              'group inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2',
              isSelected(d.key, slot.label)
                ? isLight
                  ? 'bg-brand-green text-white shadow-[0_6px_18px_-6px_rgba(0,82,61,0.55)] focus-visible:ring-brand-green'
                  : 'bg-brand-mint text-brand-green shadow-[0_6px_18px_-6px_rgba(86,255,163,0.7)] focus-visible:ring-brand-mint'
                : isLight
                  ? 'bg-white border border-black/10 text-[#0d2e22] hover:bg-black/5 hover:border-black/20 focus-visible:ring-brand-green'
                  : 'bg-white/[0.07] border border-white/15 text-white hover:bg-white/15 hover:border-white/35 focus-visible:ring-brand-mint',
            ]"
            @click="emit('select', { date: d.key, slot: slot.label })"
          >
            <component
              :is="periodIcon[slot.period]"
              class="size-3.5"
              :class="
                isSelected(d.key, slot.label)
                  ? isLight
                    ? 'text-white'
                    : 'text-brand-green'
                  : isLight
                    ? 'text-brand-green'
                    : 'text-brand-mint'
              "
              stroke-width="2.5"
            />
            {{ slot.label }}
          </motion.button>
        </div>
      </div>
    </div>

    <div
      class="pointer-events-none absolute inset-x-0 top-0 h-6"
      :style="topFadeStyle"
    />
    <div
      class="pointer-events-none absolute inset-x-0 bottom-0 h-10"
      :style="bottomFadeStyle"
    />
  </div>
</template>

<style scoped>
.custom-scroll::-webkit-scrollbar {
  width: 6px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 999px;
}
.custom-scroll.is-light::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.12);
}
.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.22);
}
.custom-scroll.is-light::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.25);
}
</style>
