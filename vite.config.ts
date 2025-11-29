import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import compression from "vite-plugin-compression";

export default defineConfig({
  base: '/',
  plugins: [
    react({
      // Optimisation: utiliser automatic JSX runtime
      jsxRuntime: 'automatic',
    }),
    runtimeErrorOverlay(),
    // Compression Gzip pour réduire la taille des fichiers
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024, // Compresser les fichiers > 1KB
    }),
    // Compression Brotli (meilleure compression)
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
    }),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace'],
        passes: 3, // More passes for better compression
        unsafe: true, // Aggressive optimizations
        unsafe_comps: true,
        unsafe_math: true,
        unsafe_methods: true,
        unsafe_proto: true,
        unsafe_regexp: true,
        unsafe_undefined: true,
        dead_code: true,
        unused: true,
      },
      mangle: {
        safari10: true,
        properties: false, // Keep property names for React
      },
      format: {
        comments: false,
      },
    },
    cssMinify: true,
    // Optimisations de build
    target: 'es2022', // Cible moderne pour plus petits bundles
    cssCodeSplit: true,
    modulePreload: {
      polyfill: true,
    },
    // Copier 404.html pour GitHub Pages SPA routing
    copyPublicDir: true,
    rollupOptions: {
      output: {
        // Simplified chunking strategy - let Vite handle React dependencies automatically
        // This ensures React is properly shared between all chunks
        manualChunks: (id) => {
          // Only split vendor code, but keep React and React-dependent libraries together
          if (id.includes('node_modules')) {
            // Don't split React, Radix UI, or any React-dependent libraries
            // Let Vite handle them automatically to ensure proper React sharing
            if (
              id.includes('react') ||
              id.includes('@radix-ui') ||
              id.includes('react-easy-crop') ||
              id.includes('scheduler') ||
              id.includes('@tanstack/react-query')
            ) {
              // Return undefined to let Vite handle these automatically
              // This ensures React is properly shared
              return undefined;
            }
            
            // Router - can be separate
            if (id.includes('wouter')) {
              return 'router';
            }
            
            // Heavy libraries that don't depend on React - can be lazy loaded
            if (id.includes('framer-motion')) {
              return 'motion';
            }
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'charts';
            }
            if (id.includes('embla-carousel')) {
              return 'carousel';
            }
            if (id.includes('vaul')) {
              return 'drawer';
            }
            
            // Other vendor code
            return 'vendor';
          }
        },
        chunkFileNames: (chunkInfo) => {
          // Noms courts pour les chunks
          return 'assets/js/[name]-[hash:8].js';
        },
        entryFileNames: 'assets/js/[name]-[hash:8].js',
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) {
            return `assets/[name]-[hash:8][extname]`;
          }
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp|avif/i.test(ext)) {
            return `assets/images/[name]-[hash:8][extname]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash:8][extname]`;
          }
          if (/css/i.test(ext)) {
            return `assets/css/[name]-[hash:8][extname]`;
          }
          return `assets/${ext}/[name]-[hash:8][extname]`;
        },
      },
      treeshake: {
        moduleSideEffects: 'no-external',
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },
    chunkSizeWarningLimit: 600, // Allow slightly larger chunks for better caching
    reportCompressedSize: true,
    assetsInlineLimit: 2048, // Inline smaller assets for faster initial load
  },
  server: {
    port: 5000,
    host: '0.0.0.0',
    cors: true,
    strictPort: false,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept',
      'Access-Control-Allow-Credentials': 'true',
    },
    fs: {
      strict: true,
      deny: ["**/.*"],
      allow: ['..'],
    },
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      clientPort: 5000,
    },
    // Allow requests from any origin in development
    origin: '*',
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'wouter',
      '@tanstack/react-query',
      '@radix-ui/react-tabs',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-slot',
      'react-easy-crop',
      'lucide-react',
      'clsx',
      'tailwind-merge',
    ],
    exclude: ['@replit/vite-plugin-cartographer', '@replit/vite-plugin-dev-banner'],
    esbuildOptions: {
      target: 'es2022',
    },
  },
  // Optimisation pour le dev et la prod
  esbuild: {
    legalComments: 'none',
    treeShaking: true,
    target: 'es2022',
    // Optimisation: supprimer les props non utilisés
    keepNames: false,
  },
  // CSS optimizations
  css: {
    devSourcemap: false,
  },
  // Preview server config
  preview: {
    port: 4173,
    host: '0.0.0.0',
  },
});
