// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  routeRules: {
    '/**': { ssr: false }
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  modules: ['@nuxtjs/supabase', '@nuxtjs/tailwindcss'],

  experimental: {
    appManifest: false,
    payloadExtraction: false
  },

  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/'],
    }
  },

  typescript: {
    strict: true,
    typeCheck: false
  },

  nitro: {
    esbuild: {
      options: {
        target: 'esnext'
      }
    },
    // Force windows paths to be treated as externals if they start with C:
    externals: {
      inline: ['date-fns', 'xlsx']
    }
  },

  // Try to fix Windows path resolution
  vite: {
    server: {
      fs: {
        strict: false
      }
    }
  }
})