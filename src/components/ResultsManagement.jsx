import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Upload, AlertCircle, Loader } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { HallOfFameCarousel } from './HallOfFameCarousel';
import { filterHallOfFame, filterTopAchievers } from '../lib/dedupeResults';
import { uploadToB2 } from '../lib/b2storage';

export function ResultsManagement({ results = [], onAdd, onUpdate, onDelete, loading = false }) {
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleAddNew = () => {
    setFormData({
      name: '',
      achievement: '',
      college: '',
      exam: '',
      rank: '',
      section: 'hallOfFame',
      photo: '',
    });
    setImagePreview(null);
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (result) => {
    setFormData({
      ...result,
      rank: result.rank || result.achievement || '',
      section: result.section || 'hallOfFame',
    });
    setImagePreview(result.photo || null);
    setEditingId(result.id);
    setShowForm(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      // Show preview while uploading
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result;
        setImagePreview(dataUrl);
      };
      reader.readAsDataURL(file);

      // Upload to B2 storage
      const result = await uploadToB2(file, 'results/');

      setFormData({
        ...formData,
        photo: result.publicUrl,
      });

      console.log('✅ Photo uploaded successfully:', result.publicUrl);
    } catch (error) {
      console.error('❌ Photo upload failed:', error);
      alert('Photo upload failed: ' + error.message);
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };


  const handleSave = async () => {
    // Only name and photo are required
    if (!formData.name.trim()) {
      alert('Student name is required');
      return;
    }

    if (!formData.photo) {
      alert('Please upload a photo');
      return;
    }

    // All other fields (college, rank, exam) are optional

    // Check Hall of Fame limit (max 10)
    if (formData.section === 'hallOfFame' && !editingId && hallOfFameResults.length >= 10) {
      alert('Hall of Fame is limited to 10 students. Please delete an entry to add a new one.');
      return;
    }

    const { rank, year: _year, id: _id, created_at: _ca, updated_at: _ua, ...rest } = formData;
    const payload = {
      name: rest.name?.trim(),
      achievement: formData.achievement || rank || '',
      college: rest.college || null,
      exam: rest.exam || null,
      section: rest.section || 'hallOfFame',
      photo: rest.photo,
      remark: rest.remark || null,
    };

    if (editingId) {
      await onUpdate(editingId, payload);
    } else {
      await onAdd(payload);
    }

    setShowForm(false);
    setFormData(null);
    setImagePreview(null);
    setEditingId(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData(null);
    setImagePreview(null);
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this student entry?')) {
      await onDelete(id);
    }
  };

  // Separate results by section
  const hallOfFameResults = filterHallOfFame(results);
  const topAchieversResults = filterTopAchievers(results);

  if (!formData && showForm) return null;

  return (
    <div className="space-y-8">
      {/* Add New Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#0A0F2C]">Results Management</h2>
        {!showForm && (
          <button
            onClick={handleAddNew}
            disabled={loading || hallOfFameResults.length >= 10 && !formData?.section}
            className="flex items-center gap-2 rounded-lg bg-[#D90429] px-4 py-2 font-semibold text-white hover:bg-[#b00320] disabled:opacity-50 transition-colors"
          >
            <Plus className="h-5 w-5" /> Add Student
          </button>
        )}
      </div>

      {/* Hall of Fame Full Alert */}
      {!showForm && hallOfFameResults.length >= 10 && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900">Hall of Fame is Full (10/10)</p>
            <p className="text-sm text-amber-700 mt-1">
              Edit or delete an existing entry to add a new one. Top Achievers section can hold 50-100+ students.
            </p>
          </div>
        </div>
      )}

      {/* Form Section */}
      {showForm && formData && (
        <GlassCard className="p-6 border-t-4 border-t-[#D90429]">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#0A0F2C]">
                {editingId ? 'Edit Student Entry' : 'Add New Student'}
              </h3>
              <button onClick={handleCancel} className="text-slate-500 hover:text-slate-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#0A0F2C]">
                    Student Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Raj Kumar"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-[#D90429] focus:outline-none"
                  />
                </div>

                {/* Rank */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#0A0F2C]">
                    Rank
                  </label>
                  <input
                    type="text"
                    value={formData.rank || ''}
                    onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                    placeholder="e.g., AIR 1, 99.5 Percentile"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-[#D90429] focus:outline-none"
                  />
                </div>

                {/* College */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#0A0F2C]">
                    College
                  </label>
                  <input
                    type="text"
                    value={formData.college || ''}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    placeholder="e.g., IIT Delhi, BITS Pilani"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-[#D90429] focus:outline-none"
                  />
                </div>

                {/* Section */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#0A0F2C]">
                    Section *
                  </label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-[#D90429] focus:outline-none"
                  >
                    <option value="hallOfFame">Hall of Fame (carousel, max 10)</option>
                    <option value="topAchievers">Top Achievers / College &amp; Exams (grid below)</option>
                  </select>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Exam */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#0A0F2C]">
                    Exam
                  </label>
                  <input
                    type="text"
                    value={formData.exam || ''}
                    onChange={(e) => setFormData({ ...formData, exam: e.target.value })}
                    placeholder="e.g., JEE Main, NEET"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-[#D90429] focus:outline-none"
                  />
                </div>

                {/* Photo Upload */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#0A0F2C]">
                    Student Photo (Circular) *
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-lg p-4 cursor-pointer hover:border-[#D90429] transition-colors relative">
                      {uploading ? (
                        <>
                          <Loader className="h-5 w-5 text-[#D90429] animate-spin" />
                          <span className="text-sm text-slate-600">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-5 w-5 text-slate-400" />
                          <span className="text-sm text-slate-600">Click to upload photo</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                    {imagePreview && (
                      <div className="flex justify-center">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-32 w-32 object-cover rounded-full border-4 border-[#D90429] shadow-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>


            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 rounded-lg bg-[#D90429] px-4 py-2 font-semibold text-white hover:bg-[#b00320] disabled:opacity-50 transition-colors"
              >
                {loading ? '💾 Saving...' : '💾 Save Student'}
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </GlassCard>
      )}

      {!showForm && (
        <>
          {/* Hall of Fame Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#0A0F2C]">
                🏆 Hall of Fame ({hallOfFameResults.length}/10)
              </h3>
              <p className="text-xs text-slate-500">Rolling carousel animation</p>
            </div>
            {hallOfFameResults.length > 0 ? (
              <>
                <HallOfFameCarousel results={hallOfFameResults} />

                {/* Edit/Delete Controls */}
                <div className="mt-6">
                  <p className="text-sm font-semibold text-[#0A0F2C] mb-3">Manage Entries</p>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
                    {hallOfFameResults.map((result) => (
                      <div key={result.id} className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
                        {result.photo && (
                          <img
                            src={result.photo}
                            alt={result.name}
                            className="h-10 w-10 object-cover rounded-full flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#0A0F2C] truncate">
                            {result.name}
                          </p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleEdit(result)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(result.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <GlassCard className="p-6 text-center">
                <p className="text-slate-600">No Hall of Fame entries yet. Add up to 10 students.</p>
              </GlassCard>
            )}
          </div>

          {/* Top Achievers Section */}
          <div>
            <h3 className="text-xl font-bold text-[#0A0F2C] mb-4">
              🎯 Top Achievers ({topAchieversResults.length}/100)
            </h3>
            {topAchieversResults.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {topAchieversResults.map((result) => (
                  <GlassCard
                    key={result.id}
                    className="p-4 text-center hover:shadow-lg transition-shadow flex flex-col"
                  >
                    {/* Circular Photo */}
                    <div className="relative mb-3 flex justify-center">
                      {result.photo ? (
                        <img
                          src={result.photo}
                          alt={result.name}
                          className="h-28 w-28 object-cover rounded-full border-3 border-slate-200 shadow-md"
                        />
                      ) : (
                        <div className="h-28 w-28 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white font-bold">
                          {result.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Name */}
                    <h4 className="font-bold text-[#0A0F2C] text-sm line-clamp-2">
                      {result.name}
                    </h4>

                    {/* Achievement */}
                    <p className="text-xs text-[#D90429] font-semibold mt-1.5 line-clamp-1">
                      {result.achievement}
                    </p>

                    {/* College */}
                    <p className="text-xs text-slate-600 mt-2 font-semibold">
                      {result.college || 'N/A'}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2 justify-center mt-3 pt-3 border-t border-slate-200">
                      <button
                        onClick={() => handleEdit(result)}
                        className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(result.id)}
                        className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            ) : (
              <GlassCard className="p-6 text-center">
                <p className="text-slate-600">No Top Achievers entries yet. You can add up to 100+ students.</p>
              </GlassCard>
            )}
          </div>
        </>
      )}
    </div>
  );
}
