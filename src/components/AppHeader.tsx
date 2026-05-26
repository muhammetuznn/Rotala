import { LogOut, UserRound } from 'lucide-react'

type AppHeaderProps = {
  email?: string | null
  onLogout: () => void
}

export function AppHeader({ email, onLogout }: AppHeaderProps) {
  const displayName = email?.split('@')[0] ?? 'Gezgin'

  return (
    <header className="sticky top-0 z-20 border-b border-[#e5d9c8] bg-[#fff9ef]/95 px-4 py-3 backdrop-blur md:px-6">
      <div className="mx-auto flex max-w-[1440px] items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#0f6b67] shadow-sm">
            <img className="h-full w-full object-cover" src="/icon.png" alt="" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-black leading-6 text-[#10251f]">Rotala</p>
            <p className="mt-0.5 text-sm font-bold leading-5 text-[#5f6c63]">Merhaba {displayName}</p>
            <p className="hidden text-sm font-medium text-[#7a6c5b] sm:block">Bugün haritanda yeni bir iz bırak.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden max-w-[220px] items-center gap-2 truncate rounded-md border border-[#e4d6c2] bg-white px-3 py-2 text-sm font-semibold text-[#55645f] md:flex">
            <UserRound size={16} aria-hidden="true" />
            <span className="truncate">{email}</span>
          </div>
          <button
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#d8cbb8] bg-white text-[#28433a] transition hover:bg-[#f4ead9]"
            onClick={onLogout}
            title="Çıkış yap"
            type="button"
          >
            <LogOut size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  )
}
