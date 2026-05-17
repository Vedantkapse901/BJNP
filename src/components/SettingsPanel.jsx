import { useState, useEffect } from 'react'
import { RotateCcw, Save, Clock } from 'lucide-react'
import { GlassCard } from './ui/GlassCard'

const DEFAULT_COLOR = '#D90429' // Default red color

const PRESET_COLORS = [
  { name: 'Red', hex: '#D90429', bg: 'bg-red-600' },
  { name: 'Blue', hex: '#3B82F6', bg: 'bg-blue-600' },
  { name: 'Green', hex: '#10B981', bg: 'bg-green-600' },
  { name: 'Purple', hex: '#A855F7', bg: 'bg-purple-600' },
  { name: 'Orange', hex: '#F97316', bg: 'bg-orange-600' },
  { name: 'Pink', hex: '#EC4899', bg: 'bg-pink-600' },
  { name: 'Teal', hex: '#14B8A6', bg: 'bg-teal-600' },
  { name: 'Indigo', hex: '#6366F1', bg: 'bg-indigo-600' },
]

export function SettingsPanel({ settings = {}, onUpdateSettings, isLoading }) {
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_COLOR)
  const [customColor, setCustomColor] = useState(DEFAULT_COLOR)
  const [timeRemaining, setTimeRemaining] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Load color from localStorage and check expiry
    const storedColor = localStorage.getItem('website_primary_color')
    const colorExpiry = localStorage.getItem('website_color_expiry')

    if (storedColor && colorExpiry) {
      const expiryTime = new Date(colorExpiry).getTime()
      const now = new Date().getTime()

      if (now < expiryTime) {
        // Color is still valid
        setPrimaryColor(storedColor)
        setCustomColor(storedColor)
        const remainingMs = expiryTime - now
        const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60))
        const remainingMins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60))
        setTimeRemaining({ hours: remainingHours, minutes: remainingMins })
      } else {
        // Color has expired, reset to default
        localStorage.removeItem('website_primary_color')
        localStorage.removeItem('website_color_expiry')
        setPrimaryColor(DEFAULT_COLOR)
        setCustomColor(DEFAULT_COLOR)
        setTimeRemaining(null)
      }
    }
  }, [])

  // Update countdown timer
  useEffect(() => {
    if (!timeRemaining) return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev.hours === 0 && prev.minutes === 0) {
          // Time expired
          localStorage.removeItem('website_primary_color')
          localStorage.removeItem('website_color_expiry')
          setPrimaryColor(DEFAULT_COLOR)
          setCustomColor(DEFAULT_COLOR)
          clearInterval(interval)
          return null
        }

        if (prev.minutes === 0) {
          return { hours: prev.hours - 1, minutes: 59 }
        }
        return { hours: prev.hours, minutes: prev.minutes - 1 }
      })
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [timeRemaining])

  const handleSaveColor = () => {
    // Set color with 24-hour expiry
    const expiryTime = new Date()
    expiryTime.setHours(expiryTime.getHours() + 24)

    localStorage.setItem('website_primary_color', customColor)
    localStorage.setItem('website_color_expiry', expiryTime.toISOString())

    setPrimaryColor(customColor)
    setTimeRemaining({ hours: 24, minutes: 0 })
    setSaved(true)

    // Update root CSS variable
    document.documentElement.style.setProperty('--primary-color', customColor)

    setTimeout(() => setSaved(false), 3000)
  }

  const handleResetColor = () => {
    if (window.confirm('Reset to default color?')) {
      localStorage.removeItem('website_primary_color')
      localStorage.removeItem('website_color_expiry')
      setPrimaryColor(DEFAULT_COLOR)
      setCustomColor(DEFAULT_COLOR)
      setTimeRemaining(null)
      document.documentElement.style.setProperty('--primary-color', DEFAULT_COLOR)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Website Color Customization */}
      <GlassCard className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">🎨 Website Color</h3>
            <p className="text-sm text-slate-600 mb-4">
              Customize the primary color of your website. Changes will be temporary and revert after 24 hours.
            </p>

            {timeRemaining && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-semibold text-blue-900">
                  Custom color active for {timeRemaining.hours}h {timeRemaining.minutes}m
                </span>
              </div>
            )}
          </div>

          {/* Preset Colors */}
          <div>
            <label className="block text-sm font-semibold mb-3">Preset Colors</label>
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => setCustomColor(color.hex)}
                  className={`h-12 rounded-lg transition-all border-2 ${
                    customColor === color.hex ? 'border-slate-900' : 'border-transparent'
                  } hover:scale-110 ${color.bg}`}
                  title={color.name}
                  aria-label={color.name}
                />
              ))}
            </div>
          </div>

          {/* Custom Color Picker */}
          <div>
            <label className="block text-sm font-semibold mb-2">Custom Color</label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="h-12 w-20 rounded-lg cursor-pointer border border-slate-300"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => {
                    if (e.target.value.match(/^#[0-9A-F]{6}$/i)) {
                      setCustomColor(e.target.value)
                    }
                  }}
                  placeholder="#D90429"
                  className="w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm"
                />
              </div>
              <div
                className="h-12 w-12 rounded-lg border-2 border-slate-300"
                style={{ backgroundColor: customColor }}
              />
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-semibold mb-3">Preview</label>
            <div className="space-y-2">
              <button
                className="w-full py-2 rounded-lg text-white font-semibold hover:opacity-90 transition-all"
                style={{ backgroundColor: customColor }}
              >
                Sample Button
              </button>
              <div
                className="h-2 rounded-full"
                style={{ backgroundColor: customColor }}
              />
              <div className="flex gap-2">
                <div
                  className="h-10 w-10 rounded-full"
                  style={{ backgroundColor: customColor }}
                />
                <div className="flex-1 h-10 rounded" style={{ backgroundColor: customColor + '20' }} />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSaveColor}
              disabled={isLoading || customColor === primaryColor}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-[#D90429] px-4 py-3 font-semibold text-white hover:bg-[#b00320] disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              Apply Color (24 hours)
            </button>
            <button
              onClick={handleResetColor}
              disabled={isLoading || primaryColor === DEFAULT_COLOR}
              className="rounded-lg bg-slate-200 px-4 py-3 font-semibold text-slate-900 hover:bg-slate-300 disabled:opacity-50 flex items-center gap-2"
            >
              <RotateCcw className="h-5 w-5" />
              Reset
            </button>
          </div>

          {saved && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-semibold text-green-900">✅ Color updated! Changes will revert in 24 hours.</p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Other Settings */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-4">⚙️ General Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Website Tagline</label>
            <input
              type="text"
              value={settings.tagline || 'Building confidence, consistency & character since 2020.'}
              onChange={(e) => onUpdateSettings({ ...settings, tagline: e.target.value })}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">WhatsApp Number</label>
            <input
              type="tel"
              value={settings.whatsapp || '917208324505'}
              onChange={(e) => onUpdateSettings({ ...settings, whatsapp: e.target.value })}
              className="w-full rounded border border-slate-300 px-3 py-2"
              placeholder="Country code + number"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Credits/Made By</label>
            <input
              type="text"
              value={settings.madeBy || 'Made with love by Vedant Kapse and Bhushan Naikwade'}
              onChange={(e) => onUpdateSettings({ ...settings, madeBy: e.target.value })}
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
          </div>

          <button
            onClick={() => onUpdateSettings(settings)}
            className="w-full rounded-lg bg-green-600 px-4 py-2 text-white font-semibold hover:bg-green-700"
          >
            Save Settings
          </button>
        </div>
      </GlassCard>
    </div>
  )
}
