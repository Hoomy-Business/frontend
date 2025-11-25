import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  textClassName?: string;
  iconClassName?: string;
}

export function Logo({ 
  className, 
  showText = true, 
  textClassName,
  iconClassName 
}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-1.5 sm:gap-2", className)}>
      <svg 
        className={cn("h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0", iconClassName)}
        viewBox="0 0 500 500"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
      >
        <g transform="translate(0,500) scale(0.1,-0.1)">
          <path d="M1828 2940 l-257 -145 -1 -807 c0 -445 2 -808 4 -808 2 0 118 58 257
129 l254 130 3 280 2 281 410 0 410 0 2 -281 3 -280 252 -130 c139 -71 255
-129 258 -129 3 0 4 363 3 807 l-3 807 -257 147 -258 148 0 -320 0 -319 -410
0 -410 0 -2 318 -3 317 -257 -145z"/>
        </g>
      </svg>
      {showText && (
        <span className={cn("text-lg sm:text-xl font-bold", textClassName)}>
          Hoomy
        </span>
      )}
    </div>
  );
}

