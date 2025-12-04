import { useRef, useEffect } from 'react';

// ============================================
// RE-RENDER TRACKING HOOK
// For development only - helps identify unnecessary re-renders
// ============================================

interface RenderInfo {
  count: number;
  lastRenderTime: number;
  lastProps: Record<string, unknown>;
  changedProps: string[];
}

const renderTracking = new Map<string, RenderInfo>();

/**
 * Track component re-renders in development
 * Use with React DevTools Profiler for complete analysis
 * 
 * @example
 * function MyComponent(props: Props) {
 *   useRenderTracker('MyComponent', props);
 *   return <div>...</div>;
 * }
 */
export function useRenderTracker(
  componentName: string,
  props: Record<string, unknown> = {},
  options: { logToConsole?: boolean; threshold?: number } = {}
): void {
  const { logToConsole = true, threshold = 5 } = options;
  const renderCount = useRef(0);
  const prevProps = useRef<Record<string, unknown>>({});
  
  // Only track in development
  if (import.meta.env.PROD) return;
  
  useEffect(() => {
    renderCount.current += 1;
    const now = performance.now();
    
    // Find changed props
    const changedProps: string[] = [];
    const allKeys = new Set([...Object.keys(props), ...Object.keys(prevProps.current)]);
    
    allKeys.forEach(key => {
      if (!Object.is(props[key], prevProps.current[key])) {
        changedProps.push(key);
      }
    });
    
    // Store tracking info
    const info: RenderInfo = {
      count: renderCount.current,
      lastRenderTime: now,
      lastProps: { ...props },
      changedProps,
    };
    renderTracking.set(componentName, info);
    
    // Log if renders exceed threshold
    if (logToConsole && renderCount.current > threshold) {
      console.warn(
        `⚠️ [RenderTracker] ${componentName} rendered ${renderCount.current} times`,
        changedProps.length > 0 ? `Changed props: ${changedProps.join(', ')}` : 'No prop changes detected'
      );
    }
    
    prevProps.current = { ...props };
  });
}

/**
 * Get render statistics for all tracked components
 */
export function getRenderStats(): Map<string, RenderInfo> {
  return new Map(renderTracking);
}

/**
 * Clear render statistics
 */
export function clearRenderStats(): void {
  renderTracking.clear();
}

/**
 * Log render statistics to console
 */
export function logRenderStats(): void {
  if (import.meta.env.PROD) return;
  
  console.group('📊 Render Statistics');
  
  const stats = Array.from(renderTracking.entries())
    .sort((a, b) => b[1].count - a[1].count);
  
  stats.forEach(([name, info]) => {
    const emoji = info.count > 10 ? '🔴' : info.count > 5 ? '🟡' : '🟢';
    console.log(`${emoji} ${name}: ${info.count} renders`);
  });
  
  console.groupEnd();
}

// Expose to window for DevTools access
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as Window & { __renderStats?: typeof getRenderStats; __logRenderStats?: typeof logRenderStats }).__renderStats = getRenderStats;
  (window as Window & { __logRenderStats?: typeof logRenderStats }).__logRenderStats = logRenderStats;
}

