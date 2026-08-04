import { UserButton } from '@clerk/react'
import { useNavigate } from 'react-router'

/** Grid/dashboard glyph for the custom menu item. */
function DashboardIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  )
}

/**
 * Clerk `UserButton` with a "Dashboard" entry added to its dropdown. Uses
 * `useNavigate` so the jump is client-side (no full reload); must be rendered
 * inside the router (it is — see App.tsx).
 */
export function UserMenu() {
  const navigate = useNavigate()

  return (
    <UserButton>
      <UserButton.MenuItems>
        <UserButton.Action
          label="Dashboard"
          labelIcon={<DashboardIcon />}
          onClick={() => navigate('/dashboard')}
        />
      </UserButton.MenuItems>
    </UserButton>
  )
}
