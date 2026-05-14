<script setup lang="ts">
import { computed } from "vue"
import { Loader2, Check } from "lucide-vue-next"
import { cn } from "@/lib/utils"
import { useThemeFlags } from "@/lib/theme"

type Variant = "primary" | "outline" | "ghost"
type Size = "default" | "icon"
type State = "default" | "loading" | "success" | "error"

const props = withDefaults(
  defineProps<{
    variant?: Variant
    size?: Size
    state?: State
    loading?: boolean
    success?: boolean
    class?: string
    type?: "button" | "submit" | "reset"
    disabled?: boolean
  }>(),
  {
    variant: "primary",
    size: "default",
    state: "default",
    loading: false,
    success: false,
    type: "button",
    disabled: false,
  }
)

const emit = defineEmits<{
  (e: "click", event: MouseEvent): void
}>()

const { isLight } = useThemeFlags()

const effectiveState = computed<State>(() => {
  if (props.state && props.state !== "default") return props.state
  if (props.loading) return "loading"
  if (props.success) return "success"
  return "default"
})

const isBusy = computed(() => effectiveState.value === "loading")
const isSuccess = computed(() => effectiveState.value === "success")
const isError = computed(() => effectiveState.value === "error")
const isInert = computed(() => props.disabled || isBusy.value || isSuccess.value)

const classes = computed(() => {
  const lightPrimary =
    "bg-brand-green text-white font-semibold hover:bg-[#003a2b] active:scale-[0.98] shadow-[0_10px_28px_-10px_rgba(0,82,61,0.55)] ring-1 ring-brand-green/30 disabled:bg-brand-green/40 disabled:text-white/80 disabled:shadow-none disabled:ring-0"
  const darkPrimary =
    "bg-[#E7D2AD] text-[#003323] font-bold hover:bg-[#f0dfbf] hover:text-[#001b0c] active:scale-[0.98] shadow-[0_12px_30px_-10px_rgba(231,210,173,0.55),inset_0_-2px_0_rgba(0,82,61,0.08)] ring-1 ring-[#E7D2AD]/70 disabled:bg-[#E7D2AD]/30 disabled:text-white/60 disabled:shadow-none disabled:ring-[#E7D2AD]/20"

  const lightOutline =
    "border border-black/15 text-[#0d2e22] bg-white hover:bg-black/5 active:scale-[0.98] disabled:text-[#0d2e22]/40 disabled:border-black/10"
  const darkOutline =
    "border-2 border-white/80 text-white bg-white/5 hover:bg-white/15 hover:border-white active:scale-[0.98] disabled:border-white/30 disabled:text-white/40 disabled:bg-transparent"

  return cn(
    "inline-flex items-center justify-center gap-2 transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    isLight.value
      ? "focus-visible:ring-offset-white focus-visible:ring-brand-green"
      : "focus-visible:ring-offset-brand-green focus-visible:ring-brand-mint",
    "disabled:pointer-events-none disabled:cursor-not-allowed",
    {
      primary: isLight.value ? lightPrimary : darkPrimary,
      outline: isLight.value ? lightOutline : darkOutline,
      ghost: isLight.value
        ? "text-[#0d2e22] hover:bg-black/5 active:scale-[0.98] disabled:text-[#0d2e22]/40"
        : "text-white hover:bg-white/10 active:scale-[0.98] disabled:text-white/40",
    }[props.variant],
    {
      default: "h-11 rounded-[10px] px-5 text-[15px]",
      icon: "h-9 w-9 rounded-full",
    }[props.size],
    isBusy.value && "cursor-wait",
    isSuccess.value &&
      props.variant === "primary" &&
      (isLight.value
        ? "bg-emerald-500 hover:bg-emerald-500 text-white shadow-[0_8px_24px_-8px_rgba(16,185,129,0.6)]"
        : "bg-emerald-400 hover:bg-emerald-400 text-emerald-950 shadow-[0_8px_24px_-8px_rgba(52,211,153,0.6)]"),
    isError.value &&
      props.variant === "primary" &&
      "bg-rose-500 hover:bg-rose-500 text-white",
    props.class
  )
})
</script>

<template>
  <button
    :type="type"
    :class="classes"
    :disabled="isInert"
    :aria-busy="isBusy || undefined"
    :aria-disabled="isInert || undefined"
    @click="(e) => emit('click', e)"
  >
    <span
      class="inline-flex items-center gap-2 transition-opacity duration-200"
      :class="(isBusy || isSuccess) && 'opacity-0'"
    >
      <slot />
    </span>

    <span
      v-if="isBusy || isSuccess || isError"
      class="absolute inset-0 inline-flex items-center justify-center gap-2"
      aria-hidden="true"
    >
      <transition
        enter-active-class="transition duration-200"
        enter-from-class="opacity-0 scale-50"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
        mode="out-in"
      >
        <Loader2 v-if="isBusy" key="loading" class="size-4 animate-spin" />
        <Check v-else-if="isSuccess" key="ok" class="size-4" stroke-width="3" />
        <span v-else-if="isError" key="err" class="text-xs font-semibold">!</span>
      </transition>
    </span>
  </button>
</template>

<style scoped>
button {
  position: relative;
}
</style>
