import { useEffect, useState } from 'react'
import { WeatherView } from '@/views/WeatherView'

type ApiStatus = 'checking' | 'online' | 'offline'

const HEALTH_CHECK_INTERVAL_MS = 5000;
const HEALTH_ENDPOINT = 'http://localhost:3000/health';

function App() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking')

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch(HEALTH_ENDPOINT)
        if (response.ok) {
          setApiStatus('online')
        } else {
          setApiStatus('offline')
        }
      } catch {
        setApiStatus('offline')
      }
    }

    checkApiStatus()
    const interval = setInterval(checkApiStatus, HEALTH_CHECK_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative flex min-h-screen flex-col bg-void">
      <header className="flex items-center justify-between border-b border-hairline px-6 py-4">
        <p className="font-mono text-sm tracking-[0.3em] text-foreground">
          TEMPO<span className="text-signal">_</span>
        </p>
        <p className="flex items-center gap-2 font-mono text-xs text-mist">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              apiStatus === 'online'
                ? 'bg-emerald-400'
                : apiStatus === 'offline'
                  ? 'bg-red-400'
                  : 'bg-amber-400'
            }`}
          />
          {apiStatus === 'online' ? 'ligado' : apiStatus === 'offline' ? 'offline' : 'verificando'}
        </p>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <WeatherView />
      </main>
    </div>
  )
}

export default App
