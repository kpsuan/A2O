import type { CalendarDate } from "@internationalized/date"

export type SlotPeriod = "morning" | "afternoon" | "evening"
export type Slot = { label: string; period: SlotPeriod }

export const baseSlots: Slot[] = [
  { label: "8:00 AM – 10:00 AM", period: "morning" },
  { label: "10:00 AM – 12:00 PM", period: "morning" },
  { label: "12:00 PM – 2:00 PM", period: "afternoon" },
  { label: "2:00 PM – 4:00 PM", period: "afternoon" },
  { label: "4:00 PM – 6:00 PM", period: "evening" },
]

function pseudoRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export function slotsForDate(date: CalendarDate): Slot[] {
  const seed = date.year * 10000 + date.month * 100 + date.day
  const scarce = pseudoRandom(seed) < 0.3
  const threshold = scarce ? 0.6 : 0.15
  return baseSlots.filter((_, i) => pseudoRandom(seed + i + 1) > threshold)
}

export function urgencyForDate(date: CalendarDate): number | null {
  const count = slotsForDate(date).length
  return count > 0 && count <= 2 ? count : null
}
