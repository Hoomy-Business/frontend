import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";
import { visualizer } from "rollup-plugin-visualizer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isDev = process.env.NODE_ENV !== "production";
const isAnalyze = process.env.ANALYZE === "true";

// ============================================
// PLUGINS
// ============================================

const plugins: PluginOption[] = [
  // SWC for 20x faster transforms than Babel
  react(),
];

// Bundle analyzer (run with: $env:ANALYZE="true"; npm run build)
if (isAnalyze) {
  plugins.push(
    visualizer({
      filename: 'dist/bundle-analysis.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap',
    }) as PluginOption
  );
}

// ============================================
// VITE CONFIG
// ============================================

export default defineConfig({
  base: '/',
  plugins,
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  
  root: path.resolve(__dirname, "client"),
  publicDir: path.resolve(__dirname, "client", "public"),
  
  // ============================================
  // BUILD CONFIGURATION
  // ============================================
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    sourcemap: isAnalyze,
    minify: 'esbuild',
    cssMinify: true,
    target: ['es2020', 'chrome87', 'firefox78', 'safari14', 'edge88'],
    cssCodeSplit: true,
    copyPublicDir: true,
    
    rollupOptions: {
      output: {
        // Simple vendor chunking that works
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'wouter'],
          'query-vendor': ['@tanstack/react-query'],
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
          ],
        },
        
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return `assets/[name]-[hash][extname]`;
          
          // Check if this is from public directory (preserve structure)
          // Vite preserves publicDir structure, but we need to ensure specific files stay at root
          const name = assetInfo.name || '';
          
          // Root-level public assets (from client/public/)
          const rootAssets = ['logo.svg', 'favicon.png', 'manifest.json', 'sw.js', '404.html'];
          if (rootAssets.some(asset => name === asset || name.endsWith('/' + asset))) {
            return '[name][extname]';
          }
          
          // Video files from public/video/ - preserve directory structure
          if (name.includes('video/') || name.includes('background.webm') || name.includes('background.mp4')) {
            // If it's already in a video path, preserve it
            if (name.includes('/')) {
              return name;
            }
            return `video/[name][extname]`;
          }
          
          // Images from public/images/ - preserve directory structure
          if (name.includes('images/') && !name.includes('assets/')) {
            // Preserve the full path
            if (name.includes('/')) {
              return name;
            }
            return `images/[name][extname]`;
          }
          
          // For imported assets (from src/), use hashed names
          const ext = name.split('.').pop()?.toLowerCase() || '';
          
          if (/png|jpe?g|svg|gif|webp|avif|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          if (ext === 'css') {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/${ext}/[name]-[hash][extname]`;
        },
      },
    },
    
    chunkSizeWarningLimit: 500,
    assetsInlineLimit: 4096,
  },
  
  // ============================================
  // DEV SERVER
  // ============================================
  server: {
    port: 5000,
    host: '0.0.0.0',
    
    hmr: {
      overlay: true,
    },
    
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    
    // Warm up critical files
    warmup: {
      clientFiles: [
        './src/App.tsx',
        './src/pages/Landing.tsx',
        './src/pages/Properties.tsx',
      ],
    },
  },
  
  // ============================================
  // DEPENDENCY OPTIMIZATION
  // ============================================
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'wouter',
      '@tanstack/react-query',
    ],
  },
  
  // ============================================
  // ESBUILD
  // ============================================
  esbuild: {
    drop: isDev ? [] : ['debugger'],
    legalComments: 'none',
    target: 'es2020',
    pure: isDev ? [] : ['console.log', 'console.debug', 'console.trace'],
  },
});
