<script setup lang="ts">
import { ref, computed, watch } from "vue"
import { motion } from "motion-v"
import { ChevronRight, Phone, Check, Loader2, X, AlertCircle, MapPin } from "lucide-vue-next"
import { useThemeFlags } from "@/lib/theme"

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{
  (e: "update:modelValue", value: string): void
  (e: "update:valid", value: boolean): void
}>()

const { isLight } = useThemeFlags()

const local = ref(props.modelValue)
watch(
  () => props.modelValue,
  (v) => (local.value = v)
)

const status = ref<"idle" | "checking" | "ok" | "error">("idle")
watch(status, (s) => emit("update:valid", s === "ok"))

const valid = computed(() => /^\d{5}$/.test(local.value.trim()))

const branches = [
  { name: "Northgate", address: "4120 Stonebrook Ave" },
  { name: "Lakeshore", address: "812 Harbor Pointe Dr" },
  { name: "Midtown", address: "207 W Cedar St, Ste 4" },
  { name: "Westview", address: "9355 Ridgeline Blvd" },
  { name: "Riverside", address: "560 Old Mill Rd" },
  { name: "Highland Park", address: "1428 Summit Crossing" },
]

const matchedBranch = ref<(typeof branches)[number] | null>(null)

function pickBranch(zip: string) {
  const sum = zip.split("").reduce((acc, c) => acc + Number(c), 0)
  return branches[sum % branches.length]
}

function onInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value.replace(/\D/g, "").slice(0, 5)
  local.value = raw
  emit("update:modelValue", raw)
  // Reset any validation feedback as soon as the user edits the field again.
  if (status.value === "ok" || status.value === "error") status.value = "idle"
}

function find() {
  if (!valid.value) return
  status.value = "checking"
  setTimeout(() => {
    // Mock: "00000" simulates an unserviceable area.
    if (local.value === "00000") {
      matchedBranch.value = null
      status.value = "error"
    } else {
      matchedBranch.value = pickBranch(local.value)
      status.value = "ok"
    }
  }, 900)
}
</script>

<template>
  <div class="w-full flex flex-col items-center gap-7">
    <motion.p
      :initial="{ opacity: 0, y: -6 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ delay: 0.15, duration: 0.4 }"
      :class="[
        'text-center w-full max-w-[560px] text-[17px] sm:text-[21px] leading-[1.45] font-display tracking-[-0.005em]',
        isLight ? 'text-[#0d2e22]' : 'text-white',
      ]"
    >
      We use your zip code to find the closest licensed tech and confirm we serve your area.
    </motion.p>

    <motion.form
      :initial="{ opacity: 0, y: 10 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ delay: 0.25, duration: 0.45, ease: [0.22, 1, 0.36, 1] }"
      class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-[560px]"
      @submit.prevent="find"
    >
      <div class="relative flex-1">
        <input
          :value="local"
          @input="onInput"
          type="text"
          inputmode="numeric"
          autocomplete="postal-code"
          placeholder="Enter zip code here"
          aria-label="Zip code"
          :aria-invalid="status === 'error' || undefined"
          :class="[
            'w-full h-[52px] rounded-[12px] px-5 pr-12 text-[15px] font-medium outline-none transition-all duration-200',
            status === 'error'
              ? isLight
                ? 'bg-white text-[#0d2e22] placeholder:text-[#0d2e22]/40 border border-rose-500/70 focus:border-rose-500 focus:shadow-[0_0_0_3px_rgba(244,63,94,0.2)]'
                : 'bg-white text-rose-700 placeholder:text-rose-400 ring-2 ring-rose-400/70 focus:shadow-[0_0_0_3px_rgba(244,63,94,0.35)]'
              : isLight
                ? 'bg-white text-[#0d2e22] placeholder:text-[#0d2e22]/40 border border-black/15 focus:border-brand-green focus:shadow-[0_0_0_3px_rgba(0,82,61,0.18)]'
                : 'bg-white text-brand-green placeholder:text-brand-green/40 focus:shadow-[0_0_0_3px_rgba(86,255,163,0.45)]',
          ]"
        />
        <transition
          enter-active-class="transition duration-200"
          enter-from-class="opacity-0 scale-50"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-150"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
          mode="out-in"
        >
          <span
            v-if="status === 'ok'"
            key="ok"
            :class="[
              'absolute right-3 top-1/2 -translate-y-1/2 grid place-items-center size-7 rounded-full',
              isLight ? 'bg-brand-green text-white' : 'bg-brand-mint text-brand-green',
            ]"
          >
            <Check class="size-4" stroke-width="3" />
          </span>
          <span
            v-else-if="status === 'error'"
            key="error"
            class="absolute right-3 top-1/2 -translate-y-1/2 grid place-items-center size-7 rounded-full bg-rose-500 text-white"
          >
            <X class="size-4" stroke-width="3" />
          </span>
        </transition>
      </div>
      <motion.button
        type="submit"
        :while-hover="valid ? { x: 2 } : {}"
        :while-tap="valid ? { scale: 0.97 } : {}"
        :disabled="!valid || status === 'checking'"
        :class="[
          'h-[52px] px-6 rounded-[12px] font-semibold inline-flex items-center gap-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          isLight
            ? 'bg-brand-green text-white hover:bg-[#003a2b] shadow-[0_8px_22px_-10px_rgba(0,82,61,0.55)] focus-visible:ring-brand-green'
            : 'bg-brand-green-deep border border-white/15 text-white hover:bg-brand-green-deep/80 focus-visible:ring-brand-mint',
        ]"
      >
        <span v-if="status !== 'checking'">Find</span>
        <span v-else>Checking</span>
        <Loader2 v-if="status === 'checking'" class="size-4 animate-spin" />
        <ChevronRight v-else class="size-4" />
      </motion.button>
    </motion.form>

    <transition
      enter-active-class="transition duration-300"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
      mode="out-in"
    >
      <div
        v-if="status === 'ok' && matchedBranch"
        key="ok"
        class="w-full max-w-[560px] flex flex-col items-center gap-3"
      >
        <p
          :class="[
            'text-[17px] sm:text-[19px] font-semibold font-display tracking-[-0.01em] text-center',
            isLight ? 'text-brand-green' : 'text-brand-mint',
          ]"
        >
          Great — we service that area and have a branch near you. Pick a time next.
        </p>
        <div
          :class="[
            'w-full rounded-[14px] px-4 py-3.5 flex items-center gap-3.5',
            isLight
              ? 'bg-white border border-black/10 shadow-[0_2px_10px_-4px_rgba(13,46,34,0.12)]'
              : 'bg-white/[0.06] border border-white/15 backdrop-blur',
          ]"
        >
          <span
            :class="[
              'grid place-items-center size-10 rounded-full shrink-0',
              isLight ? 'bg-[#f1f4f2] text-[#0d2e22]' : 'bg-white/10 text-white',
            ]"
          >
            <MapPin class="size-5" stroke-width="2.25" />
          </span>
          <div class="flex-1 min-w-0">
            <div
              :class="[
                'font-display font-semibold text-[15px] leading-tight tracking-[-0.01em]',
                isLight ? 'text-[#0d2e22]' : 'text-white',
              ]"
            >
              Precision · {{ matchedBranch.name }}
            </div>
            <div
              :class="[
                'text-[13px] truncate',
                isLight ? 'text-[#0d2e22]/65' : 'text-white/65',
              ]"
            >
              {{ matchedBranch.address }}
            </div>
          </div>
        </div>
      </div>
      <p
        v-else-if="status === 'error'"
        key="err"
        :class="[
          'inline-flex items-center gap-2 text-[16px] font-semibold font-display tracking-[-0.01em]',
          isLight ? 'text-rose-600' : 'text-rose-300',
        ]"
        role="alert"
      >
        <AlertCircle class="size-4" stroke-width="2.5" />
        We couldn't find a location near you. Try a different zip code.
      </p>
    </transition>

    <motion.div
      :initial="{ opacity: 0, y: 8 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ delay: 0.4, duration: 0.4 }"
      :class="[
        'inline-flex items-center gap-2.5 rounded-full px-4 sm:px-5 py-2.5 text-[12px] sm:text-[13px] mt-2 text-center',
        isLight
          ? 'bg-[#fff4e2] border border-[#f0d9aa] text-[#3a2a09]'
          : 'bg-white/[0.07] border border-white/10 text-white/85 backdrop-blur',
      ]"
    >
      <Phone
        :class="['size-3.5', isLight ? 'text-[#a67214]' : 'text-brand-mint']"
      />
      <span>
        Prefer to speak with someone? Call
        <a
          href="tel:+15551234567"
          :class="[
            'font-semibold transition-colors',
            isLight ? 'text-brand-green hover:text-brand-green/80' : 'text-white hover:text-brand-mint',
          ]"
        >
          (555) 123-4567
        </a>
        · Mon–Sat, 7am–7pm
      </span>
    </motion.div>
  </div>
</template>
