import { useState, useEffect } from 'react'
import { Palette, RotateCcw, Clock } from 'lucide-react'
import { GlassCard } from './ui/GlassCard'

// Function to determine if a color is light or dark
const getTextColorForBackground = (hexColor) => {
  // Remove # if present
  const hex = hexColor.replace('#', '')
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  // Calculate brightness (luminance)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  // Return white for dark backgrounds, dark for light backgrounds
  return brightness > 155 ? '#000000' : '#FFFFFF'
}

const PRESET_COLORS = [
  { name: 'Red (Default)', hex: '#D90429', bg: 'bg-red-600' },
  { name: 'Blue', hex: '#3B82F6', bg: 'bg-blue-600' },
  { name: 'Green', hex: '#10B981', bg: 'bg-green-600' },
  { name: 'Orange', hex: '#F97316', bg: 'bg-orange-600' },
  { name: 'Yellow', hex: '#EAB308', bg: 'bg-yellow-500' },
]

const DEFAULT_COLOR = '#D90429'

export function ColorChangePanel() {
  const [timeRemaining, setTimeRemaining] = useState(null)
  const [message, setMessage] = useState('')
  const [activeColor, setActiveColor] = useState(DEFAULT_COLOR)

  // Load saved color on mount
  useEffect(() => {
    const savedColor = localStorage.getItem('website_primary_color')
    const colorExpiry = localStorage.getItem('website_color_expiry')

    if (savedColor && colorExpiry) {
      const expiryTime = new Date(colorExpiry).getTime()
      const now = new Date().getTime()

      if (now < expiryTime) {
        // Color is still valid
        setActiveColor(savedColor)
        updateTimeRemaining(expiryTime)

        // Get text color
        const textColor = getTextColorForBackground(savedColor)

        // Apply the color override style
        let styleEl = document.getElementById('color-override-style')
        if (!styleEl) {
          styleEl = document.createElement('style')
          styleEl.id = 'color-override-style'
          document.head.appendChild(styleEl)
        }

        styleEl.textContent = `
          :root {
            --primary-color: ${savedColor} !important;
            --primary-text-color: ${textColor} !important;
          }

          /* Change navbar background and text color */
          #main-navbar {
            background-color: ${savedColor} !important;
            color: ${textColor} !important;
          }

          #main-navbar a,
          #main-navbar button,
          #main-navbar span {
            color: ${textColor} !important;
          }

          /* Navbar active link underline */
          #main-navbar a.border-b-2,
          #main-navbar .border-b-2 {
            border-bottom-color: ${textColor} !important;
          }

          /* Navbar hover states */
          #main-navbar a:hover {
            color: ${textColor} !important;
          }

          /* Change footer background and text color */
          #main-footer {
            background-color: ${savedColor} !important;
            color: ${textColor} !important;
          }

          #main-footer a,
          #main-footer span {
            color: ${textColor} !important;
          }

          /* Footer border */
          #main-footer .border-t {
            border-top-color: ${textColor} !important;
          }

          /* Footer hover states */
          #main-footer a:hover {
            color: ${textColor} !important;
          }

          /* All text elements within navbar and footer */
          #main-navbar h3,
          #main-navbar h4,
          #main-navbar p,
          #main-footer h3,
          #main-footer h4,
          #main-footer p {
            color: ${textColor} !important;
          }

          /* IMPORTANT: Only apply background color to navbar/footer containers, NOT to individual links */
          #main-navbar a {
            background-color: transparent !important;
          }

          #main-footer a {
            background-color: transparent !important;
          }
        `

        document.documentElement.style.setProperty('--primary-color', savedColor)
        document.documentElement.style.setProperty('--primary-text-color', textColor)
      } else {
        // Color has expired
        localStorage.removeItem('website_primary_color')
        localStorage.removeItem('website_color_expiry')
        setActiveColor(DEFAULT_COLOR)
      }
    }
  }, [])

  // Update countdown
  useEffect(() => {
    if (!timeRemaining) return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev && prev.hours === 0 && prev.minutes === 0) {
          // Time expired, revert to default
          localStorage.removeItem('website_primary_color')
          localStorage.removeItem('website_color_expiry')
          setActiveColor(DEFAULT_COLOR)
          setSelectedColor(DEFAULT_COLOR)
          setCustomColor(DEFAULT_COLOR)
          setMessage('✅ Color reverted to default after 24 hours')
          return null
        }

        if (prev) {
          if (prev.minutes === 0) {
            return { hours: prev.hours - 1, minutes: 59 }
          }
          return { hours: prev.hours, minutes: prev.minutes - 1 }
        }
        return null
      })
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [timeRemaining])

  const updateTimeRemaining = (expiryTime) => {
    const now = new Date().getTime()
    const remainingMs = expiryTime - now
    const hours = Math.floor(remainingMs / (1000 * 60 * 60))
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60))
    setTimeRemaining({ hours, minutes })
  }

  const handleApplyColor = (color) => {
    // Set 24-hour expiry
    const expiryTime = new Date()
    expiryTime.setHours(expiryTime.getHours() + 24)

    localStorage.setItem('website_primary_color', color)
    localStorage.setItem('website_color_expiry', expiryTime.toISOString())

    // Get appropriate text color based on background brightness
    const textColor = getTextColorForBackground(color)
    localStorage.setItem('website_text_color', textColor)

    setActiveColor(color)
    updateTimeRemaining(expiryTime.getTime())

    // Update CSS variables globally
    document.documentElement.style.setProperty('--primary-color', color)
    document.documentElement.style.setProperty('--primary-text-color', textColor)

    // Add global style override for all hardcoded color elements
    let styleEl = document.getElementById('color-override-style')
    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.id = 'color-override-style'
      document.head.appendChild(styleEl)
    }

    styleEl.textContent = `
      :root {
        --primary-color: ${color} !important;
        --primary-text-color: ${textColor} !important;
      }

      /* Change navbar background and text color */
      #main-navbar {
        background-color: ${color} !important;
        color: ${textColor} !important;
      }

      #main-navbar a,
      #main-navbar button,
      #main-navbar span {
        color: ${textColor} !important;
      }

      /* Navbar active link underline */
      #main-navbar a.border-b-2,
      #main-navbar .border-b-2 {
        border-bottom-color: ${textColor} !important;
      }

      /* Navbar hover states */
      #main-navbar a:hover {
        color: ${textColor} !important;
      }

      /* Change footer background and text color */
      #main-footer {
        background-color: ${color} !important;
        color: ${textColor} !important;
      }

      #main-footer a,
      #main-footer span {
        color: ${textColor} !important;
      }

      /* Footer border */
      #main-footer .border-t {
        border-top-color: ${textColor} !important;
      }

      /* Footer hover states */
      #main-footer a:hover {
        color: ${textColor} !important;
      }

      /* All text elements within navbar and footer */
      #main-navbar h3,
      #main-navbar h4,
      #main-navbar p,
      #main-footer h3,
      #main-footer h4,
      #main-footer p {
        color: ${textColor} !important;
      }

      /* IMPORTANT: Only apply background color to navbar/footer containers, NOT to individual links */
      #main-navbar a {
        background-color: transparent !important;
      }

      #main-footer a {
        background-color: transparent !important;
      }
    `

    setMessage(`✅ Color changed! Will revert after 24 hours.`)
    setTimeout(() => setMessage(''), 4000)
  }

  const handleResetColor = () => {
    if (window.confirm('Reset website color to default?')) {
      localStorage.removeItem('website_primary_color')
      localStorage.removeItem('website_color_expiry')
      setActiveColor(DEFAULT_COLOR)
      setTimeRemaining(null)

      // Reset CSS variable and remove override style
      document.documentElement.style.setProperty('--primary-color', DEFAULT_COLOR)
      const styleEl = document.getElementById('color-override-style')
      if (styleEl) {
        styleEl.remove()
      }

      setMessage('✅ Color reset to default')
      setTimeout(() => setMessage(''), 4000)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Palette className="h-8 w-8 text-[#D90429]" />
        <div>
          <h2 className="text-2xl font-bold text-slate-900">🎨 Website Color Change</h2>
          <p className="text-sm text-slate-600">Change the entire website accent color for 24 hours</p>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-green-800">
          {message}
        </div>
      )}

      {/* Current Color & Timer */}
      <GlassCard className="p-6 bg-slate-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600 font-semibold mb-2">CURRENT COLOR</p>
            <div className="flex items-center gap-4">
              <div
                className="h-16 w-16 rounded-lg border-4 border-slate-300 shadow-md"
                style={{ backgroundColor: activeColor }}
              />
              <div>
                <p className="text-lg font-bold text-slate-900">{activeColor.toUpperCase()}</p>
                <p className="text-sm text-slate-600">Live on website</p>
              </div>
            </div>
          </div>

          {timeRemaining && (
            <div className="text-right">
              <div className="flex items-center gap-2 text-[#D90429] font-bold mb-2">
                <Clock className="h-5 w-5" />
                <span>
                  {timeRemaining.hours}h {timeRemaining.minutes}m remaining
                </span>
              </div>
              <p className="text-xs text-slate-500">Auto-reverts to default</p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Preset Colors */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Choose a Color</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PRESET_COLORS.map((color) => (
            <button
              key={color.hex}
              onClick={() => handleApplyColor(color.hex)}
              className={`p-4 rounded-lg border-2 transition-all text-center font-semibold text-sm ${
                activeColor === color.hex
                  ? 'border-slate-900 scale-105'
                  : 'border-slate-200 hover:border-slate-400'
              }`}
              style={{ backgroundColor: `${color.hex}20` }}
            >
              <div
                className="h-10 w-full rounded-md mb-2"
                style={{ backgroundColor: color.hex }}
              />
              <p className="text-slate-900">{color.name}</p>
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Reset Button */}
      {activeColor !== DEFAULT_COLOR && (
        <button
          onClick={handleResetColor}
          className="flex items-center gap-2 px-6 py-3 border-2 border-slate-300 text-slate-700 font-bold rounded-lg hover:border-red-400 hover:text-red-600 transition-colors w-full justify-center"
        >
          <RotateCcw className="h-5 w-5" />
          Reset to Default Color Now
        </button>
      )}

      {/* Info Box */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 How it works:</strong> Select a color to change the entire website (navbar, accent, footer). Changes last 24 hours then auto-revert to red. Change again anytime to get another 24 hours.
        </p>
      </div>
    </div>
  )
}
