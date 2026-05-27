import { useMemo, useState } from 'react'
import { Compass, Landmark, Map, Search } from 'lucide-react'
import { AppHeader } from './components/AppHeader'
import { AuthScreen } from './components/AuthScreen'
import { CityDetailPanel } from './components/CityDetailPanel'
import { CityPicker } from './components/CityPicker'
import { BoundaryMap } from './components/BoundaryMap'
import { ProgressSummary } from './components/ProgressSummary'
import { RegionProgress } from './components/RegionProgress'
import { StoryPoster } from './components/StoryPoster'
import { cities } from './data/cities'
import { getTurkeyStats, toggleCityVisited, togglePlace } from './lib/progress'
import { useAuth } from './hooks/useAuth'
import { useBoundaryData } from './hooks/useBoundaryData'
import { useProgress } from './hooks/useProgress'
import heroBackground from '../Assets/background.png'
import type { City } from './types/domain'

function App() {
  const { user, loading: authLoading, login, logout, register } = useAuth()
  const { progress, loading: progressLoading, updateProgress } = useProgress(user?.id)
  const { districts, loading: boundaryLoading, provinces } = useBoundaryData()
  const [selectedCity, setSelectedCity] = useState<City | undefined>()
  const [selectedDistrict, setSelectedDistrict] = useState<string | undefined>()

  const selectedCityForDesktop = useMemo(() => selectedCity ?? cities[0], [selectedCity])
  const turkeyStats = useMemo(() => getTurkeyStats(progress), [progress])
  const selectCity = (city: City) => {
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
    <main className="rotala-shell rotala-shell--home">
      <div className="rotala-bg" style={{ backgroundImage: `url(${heroBackground})` }} />
      <AppHeader email={user.email} onLogout={logout} />

      <div className="rotala-stage">
        <section className="home-atlas" aria-label="Rotala keşif ana ekranı">
            <div className="home-copy">
              <p className="kicker">Premium seyahat atlası</p>
              <h1>Türkiye’yi keşfet,<br />iz bırak.</h1>
              <p className="home-subtitle">İllere dokun, haritada iz bırak.</p>
            </div>

            <div className="home-map">
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
              <div className="home-map-metrics" aria-label={`${turkeyStats.visitedCityCount} / ${turkeyStats.cityCount} şehir, ${turkeyStats.visitedPlaceCount} / ${turkeyStats.placeCount} yer`}>
                <span>
                  <Map size={16} aria-hidden="true" />
                  <b>{turkeyStats.visitedCityCount}/{turkeyStats.cityCount}</b>
                </span>
                <span>
                  <Landmark size={16} aria-hidden="true" />
                  <b>{turkeyStats.visitedPlaceCount}/{turkeyStats.placeCount}</b>
                </span>
              </div>
              <div className="floating-search">
                <Search size={16} aria-hidden="true" />
                <CityPicker selectedCity={selectedCity} onSelectCity={selectCity} />
              </div>
            </div>

            <div className="home-progress">
              <ProgressSummary progress={progress} />
            </div>

            <div className="home-regions">
              <RegionProgress compact progress={progress} />
              <StoryPoster progress={progress} provinces={provinces} />
            </div>

            <div className="desktop-detail">
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
        </section>
      </div>

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

      {progressLoading && (
        <div className="sync-pill">
          İlerleme yükleniyor
        </div>
      )}
    </main>
  )
}

function LoadingScreen() {
  return (
    <main className="loading-screen">
      <div>
        <Compass className="loading-compass" size={38} aria-hidden="true" />
        <p>Rotala açılıyor</p>
      </div>
    </main>
  )
}

export default App
