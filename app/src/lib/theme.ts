import { computed, inject, provide, ref, type InjectionKey, type Ref } from "vue"

export type Theme = "dark" | "light"

const themeKey: InjectionKey<Ref<Theme>> = Symbol("scheduler-theme")

export function provideTheme(initial: Theme = "dark") {
  const theme = ref<Theme>(initial)
  provide(themeKey, theme)
  return theme
}

export function useTheme() {
  const theme = inject(themeKey)
  if (!theme) {
    // Fall back to dark when used outside the provider so components remain renderable in isolation.
    return ref<Theme>("dark")
  }
  return theme
}

export function useThemeFlags() {
  const theme = useTheme()
  const isDark = computed(() => theme.value === "dark")
  const isLight = computed(() => theme.value === "light")
  return { theme, isDark, isLight }
}
