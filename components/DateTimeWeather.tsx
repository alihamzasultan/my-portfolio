'use client'

import { useState, useEffect, memo } from 'react'
import { FaExclamationTriangle } from 'react-icons/fa'

interface WeatherData {
  temp: number
  code: number
  description: string
}

function DateTimeWeather() {
  const [mounted, setMounted] = useState(false)
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loadingWeather, setLoadingWeather] = useState(true)
  const [weatherError, setWeatherError] = useState(false)

  const [isNight, setIsNight] = useState(false)

  // 1. Live Time Update (Karachi Time Zone)
  useEffect(() => {
    setMounted(true)
    const updateTime = () => {
      const now = new Date()
      
      // Safe Hour parsing for Karachi night shift check
      const delhiHour = parseInt(
        new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Karachi',
          hour: 'numeric',
          hour12: false
        }).format(now),
        10
      )
      setIsNight(delhiHour >= 18 || delhiHour < 6)

      // Format Karachi Time
      const timeFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Karachi',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
      
      const dateFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Karachi',
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      })

      setTime(timeFormatter.format(now))
      setDate(dateFormatter.format(now))
    }

    updateTime()
    const timer = setInterval(updateTime, 10000)
    return () => clearInterval(timer)
  }, [])

  // 2. Fetch Karachi Weather from Open-Meteo (resilient, keyless)
  useEffect(() => {
    if (!mounted) return

    const fetchWeather = async () => {
      try {
        setLoadingWeather(true)
        
        // Prevent fetching if browser is offline to avoid console TypeError
        if (typeof window !== 'undefined' && !navigator.onLine) {
          setWeatherError(true)
          return
        }

        // Karachi Coordinates: Lat 24.8607, Lon 67.0011
        const res = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=24.8607&longitude=67.0011&current=temperature_2m,weather_code'
        )
        if (!res.ok) throw new Error('API failure')
        const data = await res.json()
        
        const temp = Math.round(data.current.temperature_2m)
        const code = data.current.weather_code
        
        // Map weather code to description
        let description = 'Clear'
        if (code === 0) description = 'Sunny'
        else if ([1, 2, 3].includes(code)) description = 'Partly Cloudy'
        else if ([45, 48].includes(code)) description = 'Foggy'
        else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) description = 'Rainy'
        else if ([71, 73, 75, 77, 85, 86].includes(code)) description = 'Snowy'
        else if ([95, 96, 99].includes(code)) description = 'Stormy'

        setWeather({ temp, code, description })
        setWeatherError(false)
      } catch (err) {
        // Use console.warn to avoid triggering Next.js dev error overlays
        console.warn('Weather fetch bypassed/failed:', err)
        setWeatherError(true)
      } finally {
        setLoadingWeather(false)
      }
    }

    fetchWeather()
    // Refresh weather every 15 minutes
    const interval = setInterval(fetchWeather, 900000)
    return () => clearInterval(interval)
  }, [mounted])

  // Don't render until mounted to prevent Next.js hydration mismatch
  if (!mounted) {
    return (
      <div className="neo-card p-4 bg-neo-pink/10 border-2 border-[color:var(--neo-border)] min-h-[82px] flex items-center justify-center animate-pulse">
        <span className="font-bold text-xs uppercase tracking-wider">Syncing Karachi Time &amp; Weather…</span>
      </div>
    )
  }

  // Get neobrutalist custom animated SVG based on weather code
  const getWeatherIcon = () => {
    if (weatherError) return <FaExclamationTriangle className="w-6 h-6 text-neo-red animate-bounce" />
    if (loadingWeather || !weather) return <div className="w-6 h-6 rounded-full border-2 border-current border-t-transparent animate-spin" />

    const code = weather.code
    
    // Sunny/Clear
    if (code === 0) {
      if (isNight) {
        return (
          <svg className="w-8 h-8 overflow-visible" viewBox="0 0 32 32" role="img" aria-label="Clear Night Icon">
            <path 
              d="M22 23 C14.5 23 8.5 17 8.5 9.5 C8.5 7.5 9 5.5 10 4 C5.5 6 3.5 11 3.5 16 C3.5 22.5 8.5 27.5 15 27.5 C20.5 27.5 25 23.5 26.5 18 C25 21.5 21.5 23 18.5 23 Z" 
              fill="#FFE600" 
              className="weather-stroke moon-cradle-rock"
              strokeWidth="2.2" 
              style={{ transformOrigin: 'center' }}
            />
          </svg>
        )
      }
      return (
        <svg className="w-8 h-8 overflow-visible" viewBox="0 0 32 32" aria-label="Sunny Icon">
          {/* Sun center */}
          <circle 
            cx="16" 
            cy="16" 
            r="6" 
            fill="#FFE600" 
            className="weather-stroke sun-center-spin"
            strokeWidth="2.2" 
            style={{ transformOrigin: 'center' }}
          />
          {/* Rays rotating */}
          <g className="sun-rays-rotate" style={{ transformOrigin: 'center' }}>
            <line x1="16" y1="3" x2="16" y2="6" className="weather-stroke" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="16" y1="26" x2="16" y2="29" className="weather-stroke" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="3" y1="16" x2="6" y2="16" className="weather-stroke" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="26" y1="16" x2="29" y2="16" className="weather-stroke" strokeWidth="2.2" strokeLinecap="round" />
            
            <line x1="6.8" y1="6.8" x2="8.9" y2="8.9" className="weather-stroke" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="23.1" y1="23.1" x2="25.2" y2="25.2" className="weather-stroke" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="6.8" y1="25.2" x2="8.9" y2="23.1" className="weather-stroke" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="23.1" y1="8.9" x2="25.2" y2="6.8" className="weather-stroke" strokeWidth="2.2" strokeLinecap="round" />
          </g>
        </svg>
      )
    }
    // Cloudy
    if ([1, 2, 3].includes(code)) {
      if (isNight) {
        return (
          <svg className="w-8 h-8 overflow-visible" viewBox="0 0 32 32" role="img" aria-label="Cloudy Night Icon">
            <path 
              d="M21 9 C17.5 9 14.5 6.5 14.5 3 C14.5 2 15 1 15.5 0.5 C12 1.5 10 4.5 10 8 C10 12.5 13.5 16 18 16 C22 16 25 13 26 9.5 C25 11 23 11 21 9 Z" 
              fill="#FFE600" 
              className="weather-stroke moon-cradle-rock"
              strokeWidth="1.8" 
              style={{ transformOrigin: '21px 9px' }}
            />
            <path 
              d="M6 20 C6 16.5, 9.5 13.5, 13 14 C14.5 11, 19.5 11, 21.5 14 C24.5 14, 26 16.5, 26 20 C26 22, 24 24, 21 24 H11 C8 24, 6 22, 6 20 Z" 
              fill="#A5F3FC" 
              className="weather-stroke cloud-float-slow"
              strokeWidth="2.2"
              style={{ transformOrigin: 'center' }}
            />
          </svg>
        )
      }
      return (
        <svg className="w-8 h-8 overflow-visible" viewBox="0 0 32 32" aria-label="Cloudy Icon">
          {/* Peeking Sun */}
          <circle 
            cx="21" 
            cy="11" 
            r="4.5" 
            fill="#FFE600" 
            className="weather-stroke cloud-sun-spin"
            strokeWidth="1.8" 
            style={{ transformOrigin: '21px 11px' }}
          />
          {/* Fluffy Cloud */}
          <path 
            d="M6 20 C6 16.5, 9.5 13.5, 13 14 C14.5 11, 19.5 11, 21.5 14 C24.5 14, 26 16.5, 26 20 C26 22, 24 24, 21 24 H11 C8 24, 6 22, 6 20 Z" 
            fill="#A5F3FC" 
            className="weather-stroke cloud-float-slow"
            strokeWidth="2.2"
            style={{ transformOrigin: 'center' }}
          />
        </svg>
      )
    }
    // Rainy
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
      return (
        <svg className="w-8 h-8 overflow-visible" viewBox="0 0 32 32" aria-label="Rainy Icon">
          {/* Cloud */}
          <path 
            d="M6 16 C6 12.5, 9.5 9.5, 13 10 C14.5 7, 19.5 7, 21.5 10 C24.5 10, 26 12.5, 26 16 C26 18, 24 20, 21 20 H11 C8 20, 6 18, 6 16 Z" 
            fill="#C084FC" 
            className="weather-stroke cloud-float-slow"
            strokeWidth="2.2"
            style={{ transformOrigin: 'center' }}
          />
          {/* Falling raindrops */}
          <line x1="11" y1="23" x2="9" y2="28" className="weather-stroke rain-drop-1" strokeWidth="2" strokeLinecap="round" />
          <line x1="17" y1="23" x2="15" y2="28" className="weather-stroke rain-drop-2" strokeWidth="2" strokeLinecap="round" />
          <line x1="23" y1="23" x2="21" y2="28" className="weather-stroke rain-drop-3" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    }
    // Stormy
    if ([95, 96, 99].includes(code)) {
      return (
        <svg className="w-8 h-8 overflow-visible" viewBox="0 0 32 32" aria-label="Stormy Icon">
          {/* Cloud */}
          <path 
            d="M6 14 C6 10.5, 9.5 7.5, 13 8 C14.5 5, 19.5 5, 21.5 8 C24.5 8, 26 10.5, 26 14 C26 16, 24 18, 21 18 H11 C8 18, 6 16, 6 14 Z" 
            fill="#4B5563" 
            className="weather-stroke storm-cloud-shake"
            strokeWidth="2.2"
            style={{ transformOrigin: 'center' }}
          />
          {/* Bolt */}
          <polygon 
            points="18,14 11,23 15,23 12,30 21,20 17,20" 
            fill="#FFE600" 
            className="weather-stroke lightning-strike"
            strokeWidth="2"
            style={{ transformOrigin: 'center' }}
          />
        </svg>
      )
    }
    // Snowy
    if ([71, 73, 75, 77, 85, 86].includes(code)) {
      return (
        <svg className="w-8 h-8 overflow-visible" viewBox="0 0 32 32" aria-label="Snowy Icon">
          {/* Cloud */}
          <path 
            d="M6 15 C6 11.5, 9.5 8.5, 13 9 C14.5 6, 19.5 6, 21.5 9 C24.5 9, 26 11.5, 26 15 C26 17, 24 19, 21 19 H11 C8 19, 6 17, 6 15 Z" 
            fill="#E0F2FE" 
            className="weather-stroke cloud-float-slow"
            strokeWidth="2"
            style={{ transformOrigin: 'center' }}
          />
          {/* Falling Snowflakes */}
          <circle cx="11" cy="24" r="1.5" fill="currentColor" className="snow-flake-1" />
          <circle cx="16" cy="25" r="1.5" fill="currentColor" className="snow-flake-2" />
          <circle cx="21" cy="24" r="1.5" fill="currentColor" className="snow-flake-3" />
        </svg>
      )
    }

    // Default Fallback
    return (
      <svg className="w-8 h-8 animate-pulse" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="6" fill="#FFE600" className="weather-stroke" strokeWidth="2.2" />
      </svg>
    )
  }

  // Get dynamic weather category class for background color mapping
  const getWeatherCategory = () => {
    if (weatherError || loadingWeather || !weather) return 'weather-default'
    const code = weather.code
    if (code === 0) return 'weather-sunny'
    if ([1, 2, 3].includes(code)) return 'weather-cloudy'
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return 'weather-rainy'
    if ([95, 96, 99].includes(code)) return 'weather-stormy'
    if ([71, 73, 75, 77, 85, 86].includes(code)) return 'weather-snowy'
    return 'weather-default'
  }
  const weatherCategory = getWeatherCategory()

  return (
    <div className={`neo-card p-4 weather-widget ${weatherCategory} ${isNight ? 'is-night' : ''} border-2 border-[color:var(--neo-border)] shadow-neo-sm hover:scale-[1.02] transition-transform duration-150 cursor-default select-none relative overflow-hidden`}>
      {/* Inline styles for custom neobrutalist animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes sun-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes ray-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes float-slow {
          0% { transform: translateY(0); }
          100% { transform: translateY(-3px); }
        }
        @keyframes raindrop-fall {
          0% { transform: translateY(-3px) translateX(1px); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translateY(6px) translateX(-2px); opacity: 0; }
        }
        @keyframes cloud-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-1px) translateY(0.5px); }
          75% { transform: translateX(1px) translateY(-0.5px); }
        }
        @keyframes lightning-flash {
          0%, 80%, 100% { opacity: 0; transform: scale(0.9); }
          82%, 86% { opacity: 1; transform: scale(1.1) skewX(-4deg); }
          84% { opacity: 0.2; }
          90% { opacity: 1; transform: scale(1) skewX(2deg); }
          92% { opacity: 0; }
        }
        @keyframes snow-fall {
          0% { transform: translateY(-3px) translateX(-1px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(6px) translateX(1px); opacity: 0; }
        }
        @keyframes moon-rock {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(10deg); }
        }

        .sun-rays-rotate, .sun-center-spin, .cloud-sun-spin, .cloud-float-slow, .storm-cloud-shake, .lightning-strike {
          transform-box: fill-box;
          transform-origin: center;
        }

        .moon-cradle-rock {
          animation: moon-rock 6s ease-in-out infinite;
          transform-box: fill-box;
        }
        .sun-rays-rotate {
          animation: sun-spin 16s linear infinite;
        }
        .sun-center-spin {
          animation: ray-pulse 2s ease-in-out infinite;
        }
        .cloud-sun-spin {
          animation: sun-spin 12s linear infinite;
        }
        .cloud-float-slow {
          animation: float-slow 4s ease-in-out infinite alternate;
        }
        .rain-drop-1 {
          animation: raindrop-fall 1.2s infinite linear;
        }
        .rain-drop-2 {
          animation: raindrop-fall 1.2s infinite linear;
          animation-delay: 0.4s;
        }
        .rain-drop-3 {
          animation: raindrop-fall 1.2s infinite linear;
          animation-delay: 0.8s;
        }
        .storm-cloud-shake {
          animation: cloud-shake 2s ease-in-out infinite;
        }
        .lightning-strike {
          animation: lightning-flash 3s steps(1) infinite;
        }
        .snow-flake-1 {
          animation: snow-fall 1.5s infinite linear;
        }
        .snow-flake-2 {
          animation: snow-fall 1.5s infinite linear;
          animation-delay: 0.5s;
        }
        .snow-flake-3 {
          animation: snow-fall 1.5s infinite linear;
          animation-delay: 1s;
        }

        .weather-widget {
          background-color: var(--neo-pink);
          color: #000;
          transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .weather-widget .divider {
          background-color: currentColor;
          border-color: currentColor;
          opacity: 0.15;
          transition: background-color 0.3s ease, border-color 0.3s ease;
        }
        .weather-stroke {
          stroke: #000;
        }

        /* Light Mode Gradients based on current Weather Conditions */
        .weather-widget.weather-sunny {
          background-image: linear-gradient(135deg, #fde047 0%, #f59e0b 100%);
          color: #000;
        }
        .weather-widget.weather-sunny.is-night {
          background-image: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
          color: #fff;
        }
        
        .weather-widget.weather-cloudy {
          background-image: linear-gradient(135deg, #e0f2fe 0%, #cfd8dc 100%);
          color: #000;
        }
        .weather-widget.weather-cloudy.is-night {
          background-image: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          color: #fff;
        }

        .weather-widget.weather-rainy {
          background-image: linear-gradient(135deg, #4c1d95 0%, #1d4ed8 100%);
          color: #fff;
        }

        .weather-widget.weather-stormy {
          background-image: linear-gradient(135deg, #18181b 0%, #312e81 50%, #18181b 100%);
          color: #fff;
        }

        .weather-widget.weather-snowy {
          background-image: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
          color: #000;
        }
        
        /* Dark Mode Theme Class Overrides */
        html.dark-mode .weather-widget {
          background-image: none !important;
          background-color: #1e1b29 !important;
          color: var(--neo-ink) !important;
        }
        html.dark-mode .weather-widget .divider {
          background-color: var(--neo-border) !important;
          border-color: var(--neo-border) !important;
          opacity: 0.35 !important;
        }
        html.dark-mode .weather-stroke {
          stroke: var(--neo-border);
        }

        /* Dark Mode Accents (Dynamic borders & glows) */
        html.dark-mode .weather-widget.weather-sunny {
          border-color: #f59e0b !important;
          box-shadow: var(--neo-shadow-sm), 0 0 14px rgba(245, 158, 11, 0.25) !important;
        }
        html.dark-mode .weather-widget.weather-cloudy {
          border-color: #22d3ee !important;
          box-shadow: var(--neo-shadow-sm), 0 0 14px rgba(34, 211, 238, 0.25) !important;
        }
        html.dark-mode .weather-widget.weather-rainy {
          border-color: #8b5cf6 !important;
          box-shadow: var(--neo-shadow-sm), 0 0 14px rgba(139, 92, 246, 0.25) !important;
        }
        html.dark-mode .weather-widget.weather-stormy {
          border-color: #a1a1aa !important;
          box-shadow: var(--neo-shadow-sm), 0 0 14px rgba(161, 161, 170, 0.25) !important;
        }
        html.dark-mode .weather-widget.weather-snowy {
          border-color: #38bdf8 !important;
          box-shadow: var(--neo-shadow-sm), 0 0 14px rgba(56, 189, 248, 0.25) !important;
        }
      `}} />

      <div className="flex justify-between items-center relative z-10">
        {/* Left Section: Time & Date */}
        <div className="text-left">
          <div className="text-xs font-black uppercase tracking-widest text-current opacity-60 mb-0.5">
            Karachi Time
          </div>
          <div className="text-lg font-black font-mono tracking-wider text-current tabular-nums">
            {time}
          </div>
          <div className="text-xs font-bold text-current opacity-80 mt-0.5">
            {date}
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="divider h-10 w-0.5 border-l border-dashed mx-2"></div>

        {/* Right Section: Weather Temp */}
        <div className="text-right flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-black uppercase tracking-widest text-current opacity-60 mb-0.5">
              Weather
            </div>
            <div className="text-lg font-black text-current">
              {loadingWeather ? (
                <span className="text-xs animate-pulse font-bold">Loading…</span>
              ) : weatherError ? (
                <span className="text-xs font-bold text-neo-red">Offline</span>
              ) : (
                `${weather?.temp}°C`
              )}
            </div>
            <div className="text-[10px] font-extrabold text-current opacity-80 capitalize">
              {loadingWeather ? 'Syncing' : weatherError ? 'Error' : weather?.description}
            </div>
          </div>

          {/* Animated Weather Icon Container */}
          <div className="w-10 h-10 rounded border-2 border-[color:var(--neo-border)] bg-[color:var(--neo-surface)] flex items-center justify-center shadow-neo-xs flex-shrink-0">
            {getWeatherIcon()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(DateTimeWeather)
