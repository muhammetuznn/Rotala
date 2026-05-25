import { useState } from 'react'
import type { FormEvent } from 'react'
import { Compass, Loader2, MapPinned } from 'lucide-react'

type AuthScreenProps = {
  onLogin: (email: string, password: string) => Promise<void>
  onRegister: (email: string, password: string) => Promise<void>
}

export function AuthScreen({ onLogin, onRegister }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('demo@rotala.app')
  const [password, setPassword] = useState('rotala-demo')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setPending(true)
    setError('')

    try {
      if (mode === 'login') {
        await onLogin(email, password)
      } else {
        await onRegister(email, password)
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'İşlem tamamlanamadı.')
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="min-h-dvh bg-[#f6f0e5] px-4 py-6 text-[#14231f]">
      <section className="mx-auto flex min-h-[calc(100dvh-48px)] w-full max-w-md flex-col justify-center">
        <div className="mb-8">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0f6b67] text-white shadow-sm">
            <Compass aria-hidden="true" size={30} />
          </div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[#b45b38]">Türkiye gezi haritan</p>
          <h1 className="mt-2 text-5xl font-black tracking-normal text-[#10251f]">Rotala</h1>
          <p className="mt-4 max-w-sm text-base font-semibold leading-7 text-[#5e6b66]">
            Gezdiğin şehirleri kaydet, Türkiye haritanda kendi izini bırak.
          </p>
        </div>

        <form className="rounded-2xl border border-[#ded4c3] bg-[#fffaf0] p-4 shadow-sm" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 rounded-xl bg-[#f0eadf] p-1">
            <button
              className={`h-12 rounded-lg text-sm font-black ${mode === 'login' ? 'bg-white text-[#15372d] shadow-sm' : 'text-[#60716a]'}`}
              type="button"
              onClick={() => setMode('login')}
            >
              Giriş
            </button>
            <button
              className={`h-12 rounded-lg text-sm font-black ${mode === 'register' ? 'bg-white text-[#15372d] shadow-sm' : 'text-[#60716a]'}`}
              type="button"
              onClick={() => setMode('register')}
            >
              Kayıt
            </button>
          </div>

          <label className="mt-5 block text-sm font-bold text-[#263a34]" htmlFor="email">
            E-posta
          </label>
          <input
            className="mt-2 h-[52px] w-full rounded-xl border border-[#d6ddda] bg-white px-3 text-base font-semibold outline-none ring-[#0f6b67] transition focus:ring-2"
            id="email"
            inputMode="email"
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            value={email}
          />

          <label className="mt-4 block text-sm font-bold text-[#263a34]" htmlFor="password">
            Şifre
          </label>
          <input
            className="mt-2 h-[52px] w-full rounded-xl border border-[#d6ddda] bg-white px-3 text-base font-semibold outline-none ring-[#0f6b67] transition focus:ring-2"
            id="password"
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />

          {error && <p className="mt-4 rounded-lg bg-[#fff0ec] px-3 py-2 text-sm font-semibold text-[#a33d24]">{error}</p>}

          <button
            className="mt-5 flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#0f6b67] px-4 text-base font-black text-white shadow-sm transition hover:bg-[#0b5c58]"
            disabled={pending}
            type="submit"
          >
            {pending ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : <MapPinned size={18} aria-hidden="true" />}
            {mode === 'login' ? 'Rotala’ya gir' : 'Hesap oluştur'}
          </button>
        </form>

        <p className="mt-4 rounded-xl border border-[#ded4c3] bg-white/70 p-3 text-sm font-semibold leading-6 text-[#66726e]">
          Hesabın ve keşif ilerlemen Rotala API ile güvenli şekilde saklanır.
        </p>
      </section>
    </main>
  )
}
