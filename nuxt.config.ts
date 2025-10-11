// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/supabase",
    "@nuxt/fonts",
    "@element-plus/nuxt"
  ],
  css: ["~/assets/css/main.css"],
  fonts: {
    families: [
      { name: "Inter", provider: "google" }
    ]
  },
  elementPlus: {
    /** Options */
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
      include: ['dayjs'],
    },
    ssr: {
      noExternal: ['element-plus'],
    },
  },
});
