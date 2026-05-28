import { useState } from 'react'
import type { FormEvent } from 'react'
import { Loader2, MapPinned } from 'lucide-react'
import heroBackground from '../../Assets/background.png'

type AuthScreenProps = {
  onLogin: (email: string, password: string) => Promise<void>
  onRegister: (email: string, password: string) => Promise<void>
}

export function AuthScreen({ onLogin, onRegister }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('register')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    <main className="auth-shell">
      <div className="rotala-bg" style={{ backgroundImage: `url(${heroBackground})` }} />
      <section className="auth-panel">
        <div>
          <div className="auth-mark">
            <img src="/icon.png" alt="" aria-hidden="true" />
          </div>
          <p className="kicker">Türkiye gezi haritan</p>
          <h1>Rotala</h1>
          <p>
            Gezdiğin şehirleri kaydet, Türkiye haritanda kendi izini bırak.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-tabs">
            <button
              className={mode === 'login' ? 'active' : ''}
              type="button"
              onClick={() => setMode('login')}
            >
              Giriş
            </button>
            <button
              className={mode === 'register' ? 'active' : ''}
              type="button"
              onClick={() => setMode('register')}
            >
              Kayıt
            </button>
          </div>

          <label htmlFor="email">
            E-posta
          </label>
          <input
            id="email"
            inputMode="email"
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            value={email}
          />

          <label htmlFor="password">
            Şifre
          </label>
          <input
            id="password"
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />

          {error && <p className="auth-error">{error}</p>}

          <button
            className="auth-submit"
            disabled={pending}
            type="submit"
          >
            {pending ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : <MapPinned size={18} aria-hidden="true" />}
            {mode === 'login' ? 'Rotala’ya gir' : 'Hesap oluştur'}
          </button>
        </form>

        <p className="auth-footnote">
          Hesabın ve keşif ilerlemen Rotala API ile güvenli şekilde saklanır.
        </p>
      </section>
    </main>
  )
}
