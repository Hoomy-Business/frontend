import { useLocation } from 'wouter';
import { useMemo, type ReactNode, type AnchorHTMLAttributes } from 'react';

interface AbsoluteLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string;
  children: ReactNode;
}

/**
 * Link component that generates absolute URLs for proper Ctrl+click behavior
 * This ensures that when users Ctrl+click a link, it opens with the full domain
 * instead of a relative path.
 */
export function AbsoluteLink({ href, children, onClick, ...props }: AbsoluteLinkProps) {
  const [, setLocation] = useLocation();
  
  // Generate absolute URL for internal links
  const absoluteHref = useMemo(() => {
    // If it's already an absolute URL (starts with http:// or https://), use it as-is
    if (href.startsWith('http://') || href.startsWith('https://')) {
      return href;
    }
    
    // For relative paths, create absolute URL
    // Use window.location.origin to get the current domain
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}${href.startsWith('/') ? href : '/' + href}`;
  }, [href]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // For Ctrl+click, Cmd+click, or middle mouse button, let browser handle it
    if (e.ctrlKey || e.metaKey || e.button === 1) {
      // Let browser handle the navigation with absolute URL
      return;
    }
    
    // For normal clicks, prevent default and use wouter for SPA navigation
    e.preventDefault();
    setLocation(href);
    
    // Call original onClick if provided
    onClick?.(e);
  };

  return (
    <a 
      href={absoluteHref}
      onClick={handleClick}
      onAuxClick={(e) => {
        // Middle mouse button click - let browser handle it
        if (e.button === 1) {
          return;
        }
        e.preventDefault();
      }}
      style={{ textDecoration: 'none', color: 'inherit' }}
      {...props}
    >
      {children}
    </a>
  );
}

