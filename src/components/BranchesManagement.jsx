import { useState } from 'react'
import { Plus, Trash2, Edit2, X, MapPin } from 'lucide-react'
import { GlassCard } from './ui/GlassCard'

export function BranchesManagement({ branches = [], onAdd, onUpdate, onDelete, isLoading }) {
  const [editingId, setEditingId] = useState(null)

  const handleAddBranch = () => {
    onAdd({
      name: 'New Branch',
      city: '',
      address: '',
      phone: '',
      email: '',
      google_maps_link: '',
      display_order: branches.length,
    })
  }

  const handleUpdateBranch = (id, updatedData) => {
    onUpdate(id, updatedData)
  }

  const handleDeleteBranch = (id) => {
    if (window.confirm('Delete this branch?')) {
      onDelete(id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Branch Management</h2>
        <button
          onClick={handleAddBranch}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg bg-[#D90429] px-4 py-2 font-semibold text-white hover:bg-[#b00320] disabled:opacity-50"
        >
          <Plus className="h-5 w-5" /> Add Branch
        </button>
      </div>

      {/* Branches Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {branches.map((branch) => (
          <GlassCard key={branch.id} className="p-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {editingId === branch.id ? (
                    <input
                      type="text"
                      value={branch.name}
                      onChange={(e) =>
                        handleUpdateBranch(branch.id, { ...branch, name: e.target.value })
                      }
                      className="w-full rounded border border-slate-300 px-3 py-2 font-bold text-slate-900"
                    />
                  ) : (
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-[#D90429]" />
                      {branch.name}
                    </h3>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingId(editingId === branch.id ? null : branch.id)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {editingId === branch.id ? <X /> : <Edit2 className="h-5 w-5" />}
                  </button>
                  <button
                    onClick={() => handleDeleteBranch(branch.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Edit Mode */}
              {editingId === branch.id ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold mb-1">City</label>
                    <input
                      type="text"
                      value={branch.city}
                      onChange={(e) =>
                        handleUpdateBranch(branch.id, { ...branch, city: e.target.value })
                      }
                      placeholder="e.g., Mumbai, Delhi"
                      className="w-full rounded border border-slate-300 px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1 text-[#D90429]">📍 Address (Separate Field)</label>
                    <textarea
                      value={branch.address}
                      onChange={(e) =>
                        handleUpdateBranch(branch.id, { ...branch, address: e.target.value })
                      }
                      placeholder="Complete branch address with landmarks, building name, etc."
                      className="w-full rounded border-2 border-slate-300 px-3 py-2 focus:border-[#D90429]"
                      rows="3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">Phone</label>
                    <input
                      type="tel"
                      value={branch.phone}
                      onChange={(e) =>
                        handleUpdateBranch(branch.id, { ...branch, phone: e.target.value })
                      }
                      placeholder="e.g., +91-9876543210"
                      className="w-full rounded border border-slate-300 px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">Email</label>
                    <input
                      type="email"
                      value={branch.email}
                      onChange={(e) =>
                        handleUpdateBranch(branch.id, { ...branch, email: e.target.value })
                      }
                      placeholder="branch@example.com"
                      className="w-full rounded border border-slate-300 px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1 text-[#D90429]">🗺️ Google Maps Link (Separate Field)</label>
                    <input
                      type="url"
                      value={branch.google_maps_link}
                      onChange={(e) =>
                        handleUpdateBranch(branch.id, { ...branch, google_maps_link: e.target.value })
                      }
                      placeholder="Get from: right-click location on Google Maps → Copy link"
                      className="w-full rounded border-2 border-slate-300 px-3 py-2 text-sm focus:border-[#D90429]"
                    />
                    {branch.google_maps_link && (
                      <p className="text-xs text-green-600 mt-1">✓ Maps link added</p>
                    )}
                  </div>

                  <button
                    onClick={() => setEditingId(null)}
                    className="w-full rounded bg-green-600 px-4 py-2 text-white font-semibold hover:bg-green-700"
                  >
                    Save Branch
                  </button>
                </div>
              ) : (
                /* View Mode */
                <div className="space-y-2 text-sm text-slate-600">
                  {branch.city && (
                    <p>
                      <strong>City:</strong> {branch.city}
                    </p>
                  )}
                  {branch.address && (
                    <p>
                      <strong>Address:</strong> {branch.address}
                    </p>
                  )}
                  {branch.phone && (
                    <p>
                      <strong>Phone:</strong>{' '}
                      <a href={`tel:${branch.phone}`} className="text-[#D90429] hover:underline">
                        {branch.phone}
                      </a>
                    </p>
                  )}
                  {branch.email && (
                    <p>
                      <strong>Email:</strong>{' '}
                      <a href={`mailto:${branch.email}`} className="text-[#D90429] hover:underline">
                        {branch.email}
                      </a>
                    </p>
                  )}
                  {branch.google_maps_link && (
                    <p>
                      <a
                        href={branch.google_maps_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#D90429] hover:underline font-semibold flex items-center gap-1"
                      >
                        <MapPin className="h-4 w-4" />
                        View on Google Maps
                      </a>
                    </p>
                  )}
                </div>
              )}
            </div>
          </GlassCard>
        ))}
      </div>

      {branches.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500 mb-4">No branches added yet</p>
          <button
            onClick={handleAddBranch}
            className="rounded-lg bg-[#D90429] px-6 py-2 text-white font-semibold hover:bg-[#b00320]"
          >
            Add First Branch
          </button>
        </div>
      )}
    </div>
  )
}
