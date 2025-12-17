import { cn } from '@/lib/utils'

export const Logo = ({
  className,
  uniColor,
}: {
  className?: string
  uniColor?: boolean
}) => {
  return (
    <svg
      viewBox="0 0 140 22"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-5 w-auto text-foreground', className)}
      fill="none"
    >
      {/* Icon blocks */}
      <g fill={uniColor ? 'currentColor' : 'url(#open-notion-gradient)'}>
        <rect x="0" y="0" width="7" height="7" rx="1.2" />
        <rect x="9" y="0" width="7" height="7" rx="1.2" />
        <rect x="0" y="9" width="7" height="7" rx="1.2" />
        <rect x="9" y="9" width="7" height="7" rx="1.2" />
      </g>

      {/* Wordmark */}
      <text
        x="24"
        y="15"
        fontSize="16"
        fontWeight="600"
        letterSpacing="0.4"
        fontFamily="Inter, system-ui, sans-serif"
        fill={uniColor ? 'currentColor' : 'url(#open-notion-gradient)'}
      >
        OpenNotion
      </text>

      <defs>
        <linearGradient
          id="open-notion-gradient"
          x1="0"
          y1="0"
          x2="0"
          y2="22"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FF8A00" />
          <stop offset="0.5" stopColor="#FF4D6D" />
          <stop offset="1" stopColor="#7B61FF" />
        </linearGradient>
      </defs>
    </svg>
  )
}
export const LogoIcon = ({
  className,
  uniColor,
}: {
  className?: string
  uniColor?: boolean
}) => {
  return (
    <svg
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('size-5 text-foreground', className)}
      fill="none"
    >
      <g fill={uniColor ? 'currentColor' : 'url(#open-notion-gradient)'}>
        <rect x="0" y="0" width="6" height="6" rx="1.1" />
        <rect x="10" y="0" width="6" height="6" rx="1.1" />
        <rect x="0" y="10" width="6" height="6" rx="1.1" />
        <rect x="10" y="10" width="6" height="6" rx="1.1" />
      </g>

      <defs>
        <linearGradient
          id="open-notion-gradient"
          x1="0"
          y1="0"
          x2="0"
          y2="16"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FF8A00" />
          <stop offset="0.5" stopColor="#FF4D6D" />
          <stop offset="1" stopColor="#7B61FF" />
        </linearGradient>
      </defs>
    </svg>
  )
}
export const LogoStroke = ({ className }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('size-6 text-foreground', className)}
      fill="none"
    >
      {[
        [0, 0],
        [10, 0],
        [0, 10],
        [10, 10],
      ].map(([x, y], i) => (
        <rect
          key={i}
          x={x}
          y={y}
          width="6"
          height="6"
          rx="1.1"
          stroke="currentColor"
          strokeWidth="0.9"
        />
      ))}
    </svg>
  )
}
