// https://nuxt.com/docs/api/configuration/nuxt-config
import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

// Custom "Energy Boost" dark theme for fitness app
const EnergyBoostDark = definePreset(Aura, {
  semantic: {
    // Primary: Vibrant Orange (energy, motivation, action)
    primary: {
      50: '{orange.50}',
      100: '{orange.100}',
      200: '{orange.200}',
      300: '{orange.300}',
      400: '{orange.400}',
      500: '{orange.500}',
      600: '{orange.600}',
      700: '{orange.700}',
      800: '{orange.800}',
      900: '{orange.900}',
      950: '{orange.950}',
    },
    colorScheme: {
      dark: {
        // Deep, modern dark surface (slate for cool, professional look)
        surface: {
          0: '#000000',
          50: '{slate.50}',
          100: '{slate.100}',
          200: '{slate.200}',
          300: '{slate.300}',
          400: '{slate.400}',
          500: '{slate.500}',
          600: '{slate.600}',
          700: '{slate.700}',
          800: '{slate.800}',
          900: '{slate.900}',
          950: '{slate.950}',
        },
        // Bright, energetic primary for dark backgrounds
        primary: {
          color: '{orange.400}',
          contrastColor: '{slate.950}',
          hoverColor: '{orange.300}',
          activeColor: '{orange.200}',
        },
        // Glowing highlights for energy
        highlight: {
          background: 'rgba(251, 146, 60, 0.16)',
          focusBackground: 'rgba(251, 146, 60, 0.24)',
          color: 'rgba(255, 255, 255, 0.87)',
          focusColor: 'rgba(255, 255, 255, 0.87)',
        },
      },
    },
  },
})

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/supabase', '@nuxt/fonts', '@primevue/nuxt-module', '@pinia/nuxt'],
  css: ['primeicons/primeicons.css', '~/assets/css/main.css'],
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
  fonts: {
    families: [{ name: 'Inter', provider: 'google' }],
  },
  primevue: {
    options: {
      theme: {
        preset: EnergyBoostDark,
        options: {
          darkModeSelector: 'class',
          cssLayer: false,
        },
      },
      ripple: true,
    },
  },
  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/login', '/confirm'],
    },
  },
  vite: {
    ssr: {
      noExternal: ['primevue'],
    },
  },
})
