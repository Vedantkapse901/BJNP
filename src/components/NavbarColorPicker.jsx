import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

const COLOR_OPTIONS = [
  { name: 'Red', value: '#D90429', bg: 'bg-red-600' },
  { name: 'Blue', value: '#3B82F6', bg: 'bg-blue-600' },
  { name: 'Green', value: '#10B981', bg: 'bg-green-600' },
]

const MAX_CHANGES_PER_DAY = 3

export function NavbarColorPicker() {
  const [isOpen, setIsOpen] = useState(false)
  const [remainingChanges, setRemainingChanges] = useState(MAX_CHANGES_PER_DAY)
  const [message, setMessage] = useState('')
  const [currentColor, setCurrentColor] = useState('#D90429')

  // Load remaining changes on mount
  useEffect(() => {
    const lastResetTime = localStorage.getItem('color_changes_reset_time')
    const changesCount = parseInt(localStorage.getItem('color_changes_count') || '0')
    const now = new Date().getTime()

    if (lastResetTime) {
      const lastReset = new Date(lastResetTime).getTime()
      const hoursPassed = (now - lastReset) / (1000 * 60 * 60)

      if (hoursPassed >= 24) {
        // Reset counter after 24 hours
        localStorage.setItem('color_changes_count', '0')
        localStorage.setItem('color_changes_reset_time', new Date().toISOString())
        setRemainingChanges(MAX_CHANGES_PER_DAY)
      } else {
        setRemainingChanges(MAX_CHANGES_PER_DAY - changesCount)
      }
    } else {
      localStorage.setItem('color_changes_reset_time', new Date().toISOString())
      localStorage.setItem('color_changes_count', '0')
      setRemainingChanges(MAX_CHANGES_PER_DAY)
    }

    // Load current color
    const savedColor = localStorage.getItem('website_primary_color')
    if (savedColor) {
      setCurrentColor(savedColor)
    }
  }, [])

  const handleColorChange = (color) => {
    if (remainingChanges <= 0) {
      setMessage('❌ 3 changes limit reached! Try again after 24 hours.')
      setTimeout(() => setMessage(''), 4000)
      return
    }

    // Update color
    const expiryTime = new Date()
    expiryTime.setHours(expiryTime.getHours() + 24)

    localStorage.setItem('website_primary_color', color.value)
    localStorage.setItem('website_color_expiry', expiryTime.toISOString())
    document.documentElement.style.setProperty('--primary-color', color.value)

    // Update changes count
    const currentCount = parseInt(localStorage.getItem('color_changes_count') || '0')
    const newCount = currentCount + 1
    localStorage.setItem('color_changes_count', newCount.toString())

    setCurrentColor(color.value)
    setRemainingChanges(MAX_CHANGES_PER_DAY - newCount)
    setMessage(`✅ Color changed to ${color.name}! ${MAX_CHANGES_PER_DAY - newCount} chances remaining.`)
    setIsOpen(false)

    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <div className="relative">
      {/* Color Picker Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 hover:border-slate-400 transition-colors"
        title="Change website color"
      >
        <div
          className="h-4 w-4 rounded-full border border-slate-400"
          style={{ backgroundColor: currentColor }}
        />
        <span className="text-xs font-semibold text-slate-700">Color</span>
        <ChevronDown className="h-4 w-4 text-slate-600" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
          {/* Chances Display */}
          <div className="px-4 py-2 border-b border-slate-200 bg-slate-50">
            <p className="text-xs font-semibold text-slate-700">
              {remainingChanges > 0 ? (
                <>🎨 {remainingChanges} chance{remainingChanges !== 1 ? 's' : ''} left</>
              ) : (
                <>❌ No chances left (try after 24h)</>
              )}
            </p>
          </div>

          {/* Color Options */}
          <div className="p-3 space-y-2">
            {COLOR_OPTIONS.map((color) => (
              <button
                key={color.value}
                onClick={() => handleColorChange(color)}
                disabled={remainingChanges <= 0}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  currentColor === color.value
                    ? 'bg-slate-100 border-2 border-slate-400'
                    : 'border border-slate-200 hover:bg-slate-50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div
                  className="h-6 w-6 rounded-full border-2 border-slate-300"
                  style={{ backgroundColor: color.value }}
                />
                <span className="text-sm font-semibold text-slate-900">{color.name}</span>
                {currentColor === color.value && <span className="ml-auto text-sm">✓</span>}
              </button>
            ))}
          </div>

          {/* Message */}
          {message && (
            <div className="px-4 py-2 border-t border-slate-200 bg-blue-50">
              <p className="text-xs text-blue-800">{message}</p>
            </div>
          )}
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
