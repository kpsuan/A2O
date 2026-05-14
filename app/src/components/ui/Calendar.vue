<script setup lang="ts">
import { computed } from "vue"
import {
  CalendarRoot,
  CalendarHeader,
  CalendarHeading,
  CalendarPrev,
  CalendarNext,
  CalendarGrid,
  CalendarGridHead,
  CalendarHeadCell,
  CalendarGridBody,
  CalendarGridRow,
  CalendarCell,
  CalendarCellTrigger,
} from "reka-ui"
import { getLocalTimeZone, today } from "@internationalized/date"
import { ChevronLeft, ChevronRight } from "lucide-vue-next"
import { cn } from "@/lib/utils"
import { useThemeFlags } from "@/lib/theme"

// CalendarDate uses a JS hard-private field which trips strict TS prop checks
// when reactive refs round-trip through vue-tsc; widen to `any` for the
// component boundary while keeping the import for runtime usage (today / compare).
const props = defineProps<{
  modelValue: any
  minValue?: any
  urgencyForDate?: (date: any) => number | null
}>()
const emit = defineEmits<{
  (e: "update:modelValue", value: any): void
}>()

const { isLight } = useThemeFlags()

const value = computed({
  get: () => props.modelValue,
  set: (v) => v && emit("update:modelValue", v),
})

const minValue = computed(() => props.minValue ?? today(getLocalTimeZone()))

const navBtnClass = computed(() =>
  cn(
    "inline-flex items-center justify-center size-9 rounded-lg transition-colors",
    "focus-visible:outline-none focus-visible:ring-2",
    isLight.value
      ? "border border-black/10 bg-white text-[#0d2e22] hover:bg-black/5 hover:border-black/20 focus-visible:ring-brand-green"
      : "border border-white/15 bg-white/5 text-white hover:bg-white/15 hover:border-white/30 focus-visible:ring-brand-mint",
    "disabled:opacity-40 disabled:cursor-not-allowed"
  )
)

const cellTriggerClass = computed(() =>
  cn(
    "mx-auto inline-flex items-center justify-center size-10 rounded-full text-[14px] font-medium transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2",
    isLight.value
      ? [
          "text-[#0d2e22] hover:bg-black/5",
          "focus-visible:ring-brand-green",
          "data-[outside-view]:text-[#0d2e22]/30 data-[outside-view]:pointer-events-none",
          "data-[disabled]:text-[#0d2e22]/20 data-[disabled]:line-through data-[disabled]:pointer-events-none",
          "data-[today]:ring-1 data-[today]:ring-brand-green/40",
          "data-[selected]:bg-brand-green data-[selected]:text-white data-[selected]:font-semibold data-[selected]:hover:bg-brand-green data-[selected]:shadow-[0_6px_18px_-6px_rgba(0,82,61,0.55)]",
        ]
      : [
          "text-white/85 hover:bg-white/10 hover:text-white",
          "focus-visible:ring-brand-mint",
          "data-[outside-view]:text-white/25 data-[outside-view]:pointer-events-none",
          "data-[disabled]:text-white/20 data-[disabled]:line-through data-[disabled]:pointer-events-none",
          "data-[today]:ring-1 data-[today]:ring-brand-mint/60",
          "data-[selected]:bg-brand-mint data-[selected]:text-brand-green data-[selected]:font-semibold data-[selected]:hover:bg-brand-mint data-[selected]:shadow-[0_4px_18px_-4px_rgba(86,255,163,0.6)]",
        ]
  )
)
</script>

<template>
  <CalendarRoot
    v-slot="{ weekDays, grid }"
    v-model="value as any"
    :min-value="minValue"
    :weekday-format="'short'"
    :class="cn('w-full select-none', isLight ? 'text-[#0d2e22]' : 'text-white')"
  >
    <CalendarHeader class="flex items-center justify-between mb-4">
      <CalendarPrev :class="navBtnClass">
        <ChevronLeft class="size-4" />
      </CalendarPrev>
      <CalendarHeading
        :class="
          cn(
            'font-display text-[18px] tracking-[-0.01em]',
            isLight ? 'font-normal text-[#0d2e22]' : 'font-semibold text-white'
          )
        "
      />
      <CalendarNext :class="navBtnClass">
        <ChevronRight class="size-4" />
      </CalendarNext>
    </CalendarHeader>

    <CalendarGrid v-for="month in grid" :key="month.value.toString()" class="w-full border-collapse">
      <CalendarGridHead>
        <CalendarGridRow class="grid grid-cols-7 mb-1">
          <CalendarHeadCell
            v-for="day in weekDays"
            :key="day"
            :class="
              cn(
                'text-[11px] font-semibold uppercase tracking-[0.08em] py-2',
                isLight ? 'text-[#0d2e22]/55' : 'text-white/55'
              )
            "
          >
            {{ day }}
          </CalendarHeadCell>
        </CalendarGridRow>
      </CalendarGridHead>
      <CalendarGridBody>
        <CalendarGridRow
          v-for="(weekDates, idx) in month.rows"
          :key="`row-${idx}`"
          class="grid grid-cols-7"
        >
          <CalendarCell
            v-for="weekDate in weekDates"
            :key="weekDate.toString()"
            :date="weekDate"
            class="text-center p-0.5 relative"
          >
            <CalendarCellTrigger
              :day="weekDate"
              :month="month.value"
              :class="cellTriggerClass"
            />
            <template
              v-if="
                weekDate.compare(minValue) >= 0 &&
                weekDate.month === month.value.month &&
                weekDate.year === month.value.year &&
                props.urgencyForDate &&
                props.urgencyForDate(weekDate)
              "
            >
              <span
                class="pointer-events-none absolute top-0.5 right-1 grid place-items-center min-w-[16px] h-[16px] px-[3px] rounded-full bg-amber-500 text-white text-[10px] font-bold leading-none shadow-[0_2px_6px_rgba(245,158,11,0.45)] ring-1 ring-amber-600/30"
                :title="`Only ${props.urgencyForDate(weekDate)} spot${props.urgencyForDate(weekDate) === 1 ? '' : 's'} left`"
              >
                {{ props.urgencyForDate(weekDate) }}
              </span>
            </template>
          </CalendarCell>
        </CalendarGridRow>
      </CalendarGridBody>
    </CalendarGrid>
  </CalendarRoot>
</template>
