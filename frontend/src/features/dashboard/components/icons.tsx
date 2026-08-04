// Inline stroke icons used across the dashboard, mirroring the design's SVG set.
// One tiny factory keeps them consistent (24×24 grid, currentColor, round caps).

import type { SVGProps } from 'react'

type IconProps = { size?: number } & Omit<SVGProps<SVGSVGElement>, 'width' | 'height'>

function icon(paths: string[]) {
  return function Icon({ size = 16, ...rest }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...rest}
      >
        {paths.map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
    )
  }
}

export const PlusIcon = icon(['M12 5v14', 'M5 12h14'])
export const FileIcon = icon(['M14 3v5h5', 'M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'])
export const ChevronRightIcon = icon(['M9 18l6-6-6-6'])
export const SearchIcon = icon(['M11 11m-7 0a7 7 0 1 0 14 0a7 7 0 1 0-14 0', 'M21 21l-4.3-4.3'])
export const MenuIcon = icon(['M3 6h18', 'M3 12h18', 'M3 18h18'])
export const UploadIcon = icon(['M12 15V3', 'M7 8l5-5 5 5', 'M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4'])
export const SettingsIcon = icon([
  'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  'M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.2A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.2A1.6 1.6 0 0 0 4.6 7a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.2a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.2a1.6 1.6 0 0 0-1.4 1z',
])

// Metric-card icons.
export const ListIcon = icon(['M8 6h13', 'M8 12h13', 'M8 18h13', 'M3 6h.01', 'M3 12h.01', 'M3 18h.01'])
export const CheckBadgeIcon = icon(['M9 11l3 3 8-8', 'M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9'])
