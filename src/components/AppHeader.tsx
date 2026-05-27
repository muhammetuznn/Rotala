import { LogOut, UserRound } from 'lucide-react'

type AppHeaderProps = {
  email?: string | null
  onLogout: () => void
}

export function AppHeader({ email, onLogout }: AppHeaderProps) {
  const displayName = email?.split('@')[0] ?? 'Gezgin'

  return (
    <header className="app-header">
      <div className="brand-lockup">
        <div className="brand-mark">
          <img src="/icon.png" alt="" aria-hidden="true" />
        </div>
        <div>
          <p className="brand-name">Rotala</p>
          <p className="brand-note">Merhaba {displayName}</p>
        </div>
      </div>

      <div className="header-actions">
        <div className="profile-chip">
          <UserRound size={15} aria-hidden="true" />
          <span>{email}</span>
        </div>
        <button
          className="icon-button"
          onClick={onLogout}
          title="Çıkış yap"
          type="button"
        >
          <LogOut size={17} aria-hidden="true" />
        </button>
      </div>
    </header>
  )
}
