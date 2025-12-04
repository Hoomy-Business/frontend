import { useRef, useCallback, useEffect, useMemo } from 'react';

// ============================================
// STABLE-FIRST ARCHITECTURE HOOKS
// Prevent unnecessary re-renders through reference stability
// ============================================

/**
 * Returns a stable callback reference that always calls the latest function
 * Prevents re-renders when passing callbacks to memoized children
 * 
 * @example
 * const handleClick = useStableCallback((id: string) => {
 *   doSomething(id, someDependency);
 * });
 * // handleClick reference never changes, but always uses latest dependencies
 */
export function useStableCallback<T extends (...args: never[]) => unknown>(
  callback: T
): T {
  const callbackRef = useRef(callback);
  
  // Update ref on every render (no deps = always fresh)
  useEffect(() => {
    callbackRef.current = callback;
  });
  
  // Return stable function that delegates to ref
  return useCallback(
    ((...args: Parameters<T>) => callbackRef.current(...args)) as T,
    []
  );
}

/**
 * Returns a stable value reference that only changes when deeply different
 * Useful for objects/arrays that are recreated on each render
 * 
 * @example
 * const filters = useStableValue({ search, category, sort });
 * // filters reference only changes when actual values change
 */
export function useStableValue<T>(value: T): T {
  const ref = useRef<T>(value);
  const serialized = JSON.stringify(value);
  const prevSerialized = useRef(serialized);
  
  if (serialized !== prevSerialized.current) {
    ref.current = value;
    prevSerialized.current = serialized;
  }
  
  return ref.current;
}

/**
 * Creates a stable object that only changes when its values change
 * Better than useMemo for objects with primitive values
 * 
 * @example
 * const style = useStableObject({ width, height, opacity });
 */
export function useStableObject<T extends Record<string, unknown>>(obj: T): T {
  const keys = Object.keys(obj).sort();
  const values = keys.map(k => obj[k]);
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => obj, values);
}

/**
 * Debounced value hook - delays value updates
 * Useful for search inputs, filters, etc.
 * 
 * @example
 * const debouncedSearch = useDebouncedValue(searchInput, 300);
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);
  
  return debouncedValue;
}

/**
 * Previous value hook - returns the value from previous render
 * Useful for comparisons and animations
 * 
 * @example
 * const prevCount = usePrevious(count);
 * const increased = count > (prevCount ?? 0);
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}

/**
 * Throttled callback - limits how often a function can be called
 * 
 * @example
 * const handleScroll = useThrottledCallback(() => {
 *   updateScrollPosition();
 * }, 100);
 */
export function useThrottledCallback<T extends (...args: never[]) => unknown>(
  callback: T,
  delay: number
): T {
  const lastRan = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  });
  
  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      const remaining = delay - (now - lastRan.current);
      
      if (remaining <= 0) {
        lastRan.current = now;
        return callbackRef.current(...args);
      }
      
      // Schedule for later
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        lastRan.current = Date.now();
        callbackRef.current(...args);
      }, remaining);
    }) as T,
    [delay]
  );
}

// Need to import useState for useDebouncedValue
import { useState } from 'react';

