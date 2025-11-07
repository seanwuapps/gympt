// https://nuxt.com/docs/api/configuration/nuxt-config
import { definePreset } from '@primeuix/themes'
import Lara from '@primeuix/themes/lara'

// Custom "Energy Boost" dark theme for fitness app
const EnergyBoostDark = definePreset(Lara, {
  semantic: {
    // Primary: Vibrant lime (energy, motivation, action)
    primary: {
      50: '{lime.50}',
      100: '{lime.100}',
      200: '{lime.200}',
      300: '{lime.300}',
      400: '{lime.400}',
      500: '{lime.500}',
      600: '{lime.600}',
      700: '{lime.700}',
      800: '{lime.800}',
      900: '{lime.900}',
      950: '{lime.950}',
    },
    colorScheme: {
      dark: {
        // Deep, modern dark surface (slate for cool, professional look)
        surface: {
          0: '#ffffff',
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
        // Bright, energetic primary for dark backgrounds with enhanced contrast
        primary: {
          color: '#d4ff00',  // Brighter lime for WCAG AA compliance (7:1 contrast)
          contrastColor: '{slate.950}',
          hoverColor: '#e5ff33',  // Even brighter on hover
          activeColor: '#f0ff66',  // Brightest on active
        },
        // Enhanced text colors for WCAG AA compliance
        text: {
          color: 'rgba(255, 255, 255, 0.95)',  // Primary text: ~19:1 contrast
          hoverColor: 'rgba(255, 255, 255, 1)',
          mutedColor: 'rgba(255, 255, 255, 0.65)',  // Muted text: ~7:1 contrast (WCAG AA)
          hoverMutedColor: 'rgba(255, 255, 255, 0.78)',
        },
        // Glowing highlights for energy
        highlight: {
          background: 'rgba(251, 146, 60, 0.16)',
          focusBackground: 'rgba(251, 146, 60, 0.24)',
          color: 'rgba(255, 255, 255, 0.95)',  // Enhanced from 0.87
          focusColor: 'rgba(255, 255, 255, 0.95)',
        },
      },
    },
  },
  components: {
    card: {
      root: {
        background: '{surface.900}',
      },
    },
    button: {
      text: {
        primary: {
          color: '#d4ff00',  // Enhanced contrast for text buttons
          hoverColor: '#e5ff33',
          activeColor: '#f0ff66',
        },
      },
    },
  },
})

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/supabase', '@nuxt/fonts', '@primevue/nuxt-module', '@pinia/nuxt'],
  css: ['primeicons/primeicons.css', '~/assets/css/main.css', '~/assets/css/grid.css', '~/assets/css/accessibility.css'],
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
    openaiApiKey: process.env.OPENAI_API_KEY,
    openaiBaseUrl: process.env.OPENAI_BASE_URL,
    openaiModel: process.env.OPENAI_MODEL || '@cf/meta/llama-3.1-8b-instruct',
  },
  components: [
    {
      path: '~/components',
      pathPrefix: false,
      global: true,
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
          darkModeSelector: 'system',
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
