// https://nuxt.com/docs/api/configuration/nuxt-config
import Aura from '@primeuix/themes/aura'

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/supabase",
    "@nuxt/fonts",
    "@element-plus/nuxt",
    "@primevue/nuxt-module",
    "@pinia/nuxt"
  ],
  css: [
    "primeicons/primeicons.css",
    "~/assets/css/main.css"
  ],
  fonts: {
    families: [
      { name: "Inter", provider: "google" }
    ]
  },
  elementPlus: {
    /** Options */
  },
  primevue: {
    options: {
      theme: {
        preset: Aura
      },
      ripple: true,
    },
  },
  supabase: {
    redirectOptions: {
      login: "/login",
      callback: "/confirm",
      exclude: ["/login", "/confirm"],
    },
  },
  vite: {
    optimizeDeps: {
      include: [
        'dayjs',
        'dayjs/plugin/customParseFormat',
        'dayjs/plugin/advancedFormat',
        'dayjs/plugin/weekOfYear',
        'dayjs/plugin/weekYear',
        'dayjs/plugin/dayOfYear',
        'dayjs/plugin/isSameOrAfter',
        'dayjs/plugin/isSameOrBefore',
      ],
    },
    ssr: {
      noExternal: ['element-plus', 'dayjs'],
    },
  },
});
