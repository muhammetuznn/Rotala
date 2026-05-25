import { useMemo, useState } from 'react'
import { BarChart3, MapPinned, UserRound } from 'lucide-react'
import { AppHeader } from './components/AppHeader'
import { AuthScreen } from './components/AuthScreen'
import { CityDetailPanel } from './components/CityDetailPanel'
import { CityPicker } from './components/CityPicker'
import { BoundaryMap } from './components/BoundaryMap'
import { ProgressSummary } from './components/ProgressSummary'
import { RecentCities } from './components/RecentCities'
import { RegionProgress } from './components/RegionProgress'
import { cities } from './data/cities'
import { toggleCityVisited, togglePlace } from './lib/progress'
import { useAuth } from './hooks/useAuth'
import { useBoundaryData } from './hooks/useBoundaryData'
import { useProgress } from './hooks/useProgress'
import type { City } from './types/domain'

function App() {
  const { user, loading: authLoading, login, logout, register } = useAuth()
  const { progress, loading: progressLoading, updateProgress } = useProgress(user?.id)
  const { districts, loading: boundaryLoading, provinces } = useBoundaryData()
  const [selectedCity, setSelectedCity] = useState<City | undefined>()
  const [selectedDistrict, setSelectedDistrict] = useState<string | undefined>()
  const [activePage, setActivePage] = useState<'map' | 'progress' | 'profile'>('map')

  const selectedCityForDesktop = useMemo(() => selectedCity ?? cities[0], [selectedCity])
  const selectCity = (city: City) => {
    setActivePage('map')
    setSelectedCity(city)
    setSelectedDistrict(undefined)
  }

  if (authLoading) {
    return <LoadingScreen />
  }

  if (!user) {
    return <AuthScreen onLogin={login} onRegister={register} />
  }

  return (
    <main className="min-h-dvh overflow-x-hidden bg-[#f6f0e5] pb-[calc(80px+env(safe-area-inset-bottom))] text-[#14231f] lg:pb-0">
      <AppHeader email={user.email} onLogout={logout} />

      <div className="mx-auto max-w-[1440px] px-4 py-4 md:px-6 lg:px-8">
        <div className="mb-4 hidden justify-end lg:flex">
          <div className="grid grid-cols-3 rounded-xl border border-[#e0d1bb] bg-[#fffaf0] p-1 shadow-sm">
            <button
              className={`flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-black ${
                activePage === 'map' ? 'bg-[#0f6b67] text-white' : 'text-[#59675f]'
              }`}
              onClick={() => setActivePage('map')}
              type="button"
            >
              <MapPinned size={17} aria-hidden="true" />
              Harita
            </button>
            <button
              className={`flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-black ${
                activePage === 'progress' ? 'bg-[#0f6b67] text-white' : 'text-[#59675f]'
              }`}
              onClick={() => setActivePage('progress')}
              type="button"
            >
              <BarChart3 size={17} aria-hidden="true" />
              İlerleme
            </button>
            <button
              className={`flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-black ${
                activePage === 'profile' ? 'bg-[#0f6b67] text-white' : 'text-[#59675f]'
              }`}
              onClick={() => setActivePage('profile')}
              type="button"
            >
              <UserRound size={17} aria-hidden="true" />
              Profil
            </button>
          </div>
        </div>

        {activePage === 'map' ? (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_390px] lg:gap-5">
            <div className="grid gap-4 lg:min-h-[calc(100dvh-112px)] lg:content-start">
              <ProgressSummary progress={progress} />
              <BoundaryMap
                districts={districts}
                loading={boundaryLoading}
                onSelectCity={selectCity}
                onSelectDistrict={setSelectedDistrict}
                progress={progress}
                provinces={provinces}
                selectedCity={selectedCity}
                selectedDistrict={selectedDistrict}
              />
              <CityPicker selectedCity={selectedCity} onSelectCity={selectCity} />
            </div>

            <div className="hidden lg:block">
              <CityDetailPanel
                city={selectedCityForDesktop}
                districts={districts}
                onClose={() => setSelectedCity(undefined)}
                onSelectDistrict={setSelectedDistrict}
                onToggleCityVisited={(cityId) => updateProgress((current) => toggleCityVisited(current, cityId))}
                onTogglePlace={(cityId, placeId) => updateProgress((current) => togglePlace(current, cityId, placeId))}
                progress={progress}
                provinces={provinces}
                selectedDistrict={selectedDistrict}
              />
            </div>
          </div>
        ) : activePage === 'progress' ? (
          <div className="mx-auto grid max-w-6xl gap-3 lg:max-h-[calc(100dvh-145px)] lg:grid-rows-[auto_auto_1fr]">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
              <ProgressSummary compact progress={progress} />
              <section className="rounded-xl border border-[#e0d1bb] bg-[#fffaf0] p-4 shadow-sm">
                <RegionProgress compact progress={progress} />
              </section>
            </div>
            <RecentCities progress={progress} />
          </div>
        ) : (
          <div className="mx-auto max-w-lg">
            <section className="rounded-2xl border border-[#e0d1bb] bg-[#fffaf0] p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0f6b67] text-white">
                  <UserRound size={22} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black uppercase tracking-[0.14em] text-[#bd6a3d]">Profil</p>
                  <h2 className="mt-1 truncate text-xl font-black text-[#10251f]">{user.email}</h2>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[#66726e]">
                    Hesabın ve keşif ilerlemen backend üzerinde saklanıyor. Başka cihazdan giriş yaptığında izlerin yanında gelir.
                  </p>
                </div>
              </div>
              <button
                className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#e2c6bd] bg-[#fff0ec] text-sm font-black text-[#a33d24]"
                onClick={logout}
                type="button"
              >
                Çıkış yap
              </button>
            </section>
          </div>
        )}
      </div>

      {activePage === 'map' && (
      <div className="lg:hidden">
        <CityDetailPanel
          city={selectedCity}
          districts={districts}
          onClose={() => setSelectedCity(undefined)}
          onSelectDistrict={setSelectedDistrict}
          onToggleCityVisited={(cityId) => updateProgress((current) => toggleCityVisited(current, cityId))}
          onTogglePlace={(cityId, placeId) => updateProgress((current) => togglePlace(current, cityId, placeId))}
          progress={progress}
          provinces={provinces}
          selectedDistrict={selectedDistrict}
        />
      </div>
      )}

      {progressLoading && (
        <div className="fixed bottom-[calc(88px+env(safe-area-inset-bottom))] left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#10251f] px-4 py-2 text-sm font-bold text-white shadow-lg lg:bottom-4">
          İlerleme yükleniyor
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[#d8cdbb] bg-[#fffaf0]/95 px-4 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_30px_rgba(36,45,39,0.08)] backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-3 gap-2">
          <button
            className={`grid min-h-12 place-items-center rounded-lg text-xs font-black ${
              activePage === 'map' ? 'bg-[#0f6b67] text-white' : 'text-[#59675f]'
            }`}
            onClick={() => setActivePage('map')}
            type="button"
          >
            <MapPinned size={18} aria-hidden="true" />
            Harita
          </button>
          <button
            className={`grid min-h-12 place-items-center rounded-lg text-xs font-black ${
              activePage === 'progress' ? 'bg-[#0f6b67] text-white' : 'text-[#59675f]'
            }`}
            onClick={() => setActivePage('progress')}
            type="button"
          >
            <BarChart3 size={18} aria-hidden="true" />
            İlerleme
          </button>
          <button
            className={`grid min-h-12 place-items-center rounded-lg text-xs font-black ${
              activePage === 'profile' ? 'bg-[#0f6b67] text-white' : 'text-[#59675f]'
            }`}
            type="button"
            onClick={() => setActivePage('profile')}
          >
            <UserRound size={18} aria-hidden="true" />
            Profil
          </button>
        </div>
      </nav>
    </main>
  )
}

function LoadingScreen() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#f7fbf8] px-4 text-center">
      <div>
        <div className="mx-auto h-12 w-12 animate-pulse rounded-lg bg-[#1f6f5b]" />
        <p className="mt-4 text-sm font-black uppercase tracking-[0.18em] text-[#b45b38]">Rotala açılıyor</p>
      </div>
    </main>
  )
}

export default App
