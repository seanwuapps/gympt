// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  nitro: {
    preset: 'cloudflare-pages',
    prerender: {
      autoSubfolderIndex: false,
    },
  },
  app: {
    head: {
      htmlAttrs: {
        class: 'app-dark', // Kept for potential future custom dark mode
      },
    },
  },
  devtools: { enabled: true },
  modules: ['@nuxtjs/supabase', '@nuxt/fonts', '@pinia/nuxt'],
  css: ['~/assets/css/main.css', '~/assets/css/grid.css', '~/assets/css/accessibility.css'],
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
    openaiApiKey: process.env.OPENAI_API_KEY,
    openaiBaseUrl: process.env.OPENAI_BASE_URL,
    openaiModel: process.env.OPENAI_MODEL || '@cf/meta/llama-3.1-8b-instruct',
    public: {
      appUrl: process.env.NUXT_APP_URL || 'http://localhost:3000',
    },
  },
  components: [
    {
      path: '~/components',
      pathPrefix: false,
      global: true,
    },
  ],
  fonts: {
    families: [
      {
        name: 'Inter',
        provider: 'google',
        fallbacks: ['system-ui', 'sans-serif'],
      },
    ],
  },
  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/login', '/confirm'],
    },
  },
})
