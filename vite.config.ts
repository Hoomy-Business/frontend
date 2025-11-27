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
        drop_console: true, // Supprimer les console.log en production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2, // Plusieurs passes pour meilleure compression
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false, // Supprimer tous les commentaires
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
        // Ensure proper chunk dependencies and sharing
        manualChunks: (id) => {
          // Vendor chunk for node_modules
          if (id.includes('node_modules')) {
            // React core - must be in a separate chunk that other chunks can depend on
            // This ensures React is available to all chunks
            if (id.includes('react-dom') || id.includes('react/jsx-runtime') || (id.includes('react/') && !id.includes('react-easy-crop'))) {
              return 'react-core';
            }
            // Scheduler React - part of react-core
            if (id.includes('scheduler')) {
              return 'react-core';
            }
            // Router - small, separate chunk
            if (id.includes('wouter')) {
              return 'router';
            }
            // React Query - depends on React
            if (id.includes('@tanstack/react-query')) {
              return 'query';
            }
            // Image cropping - bundle with UI to ensure React is available
            // react-easy-crop needs React, so bundle it with UI components that depend on react-core
            if (id.includes('react-easy-crop')) {
              return 'ui-radix';
            }
            // Radix UI - all components including primitives (they all need React)
            // Bundle all Radix UI together to ensure React is available
            if (id.includes('@radix-ui')) {
              return 'ui-radix';
            }
            // Framer motion - heavy, lazy load
            if (id.includes('framer-motion')) {
              return 'motion';
            }
            // Lucide icons - tree-shaking
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            // Date utilities - lazy load
            if (id.includes('date-fns')) {
              return 'date-utils';
            }
            // Form handling - lazy load
            if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) {
              return 'forms';
            }
            // Charts - lazy load (heavy)
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'charts';
            }
            // Embla carousel - lazy load
            if (id.includes('embla-carousel')) {
              return 'carousel';
            }
            // Vaul (drawer) - lazy load
            if (id.includes('vaul')) {
              return 'drawer';
            }
            // Other vendor code
            return 'vendor';
          }
        },
        chunkFileNames: (chunkInfo) => {
          // Noms courts pour les chunks critiques
          const criticalChunks = ['react-core', 'router'];
          if (chunkInfo.name && criticalChunks.includes(chunkInfo.name)) {
            return 'assets/js/[name]-[hash:8].js';
          }
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
    chunkSizeWarningLimit: 500,
    reportCompressedSize: true,
    assetsInlineLimit: 4096, // Inline assets < 4KB en base64
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
