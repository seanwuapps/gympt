// https://nuxt.com/docs/api/configuration/nuxt-config
import Aura from '@primeuix/themes/aura'

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/supabase",
    "@nuxt/fonts",
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
  primevue: {
    options: {
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: false, // Disable dark mode to prevent white-on-white controls
        }
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
    ssr: {
      noExternal: ['primevue'],
    },
  },
});
