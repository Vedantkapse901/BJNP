import { useState } from 'react'
import { Calendar, Plus, Save, X } from 'lucide-react'
import { GlassCard } from './ui/GlassCard'

const STATUS_OPTIONS = [
  { value: 'present', label: '✅ Present', color: 'bg-green-100 text-green-800' },
  { value: 'absent', label: '❌ Absent', color: 'bg-red-100 text-red-800' },
  { value: 'late', label: '⏰ Late', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'excused', label: '📝 Excused', color: 'bg-blue-100 text-blue-800' },
]

export function AttendanceManagement({ students = [], attendance = [], onMarkAttendance, onBulkUpdate, isLoading }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [attendanceData, setAttendanceData] = useState({})
  const [saveStatus, setSaveStatus] = useState('')

  // Load attendance for selected date
  useState(() => {
    const dateAttendance = attendance.filter(a => a.attendance_date === selectedDate)
    const data = {}
    dateAttendance.forEach(a => {
      data[a.student_id] = a.status
    })
    setAttendanceData(data)
  }, [selectedDate, attendance])

  const handleStatusChange = (studentId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }))
  }

  const handleSaveAttendance = async () => {
    try {
      setSaveStatus('Saving attendance...')

      const updates = Object.entries(attendanceData).map(([studentId, status]) => ({
        student_id: parseInt(studentId),
        attendance_date: selectedDate,
        status: status
      }))

      await onBulkUpdate(updates)
      setSaveStatus('✅ Attendance saved successfully!')
      setTimeout(() => setSaveStatus(''), 3000)
    } catch (error) {
      setSaveStatus('❌ Error saving attendance')
      console.error(error)
    }
  }

  const getAttendanceStats = () => {
    const present = Object.values(attendanceData).filter(s => s === 'present').length
    const absent = Object.values(attendanceData).filter(s => s === 'absent').length
    const late = Object.values(attendanceData).filter(s => s === 'late').length
    const excused = Object.values(attendanceData).filter(s => s === 'excused').length
    const total = students.length
    const marked = Object.keys(attendanceData).length

    return { present, absent, late, excused, total, marked }
  }

  const stats = getAttendanceStats()

  if (!students || students.length === 0) {
    return (
      <GlassCard className="p-6 text-center">
        <p className="text-slate-600">No students found. Add students first in the Students tab.</p>
      </GlassCard>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-[#D90429]" />
            Attendance
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Mark attendance for {stats.total} students
          </p>
        </div>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="rounded-lg border border-slate-300 px-4 py-2"
        />
      </div>

      {/* Status Message */}
      {saveStatus && (
        <div className={`rounded-lg p-4 ${
          saveStatus.includes('✅')
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {saveStatus}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <GlassCard className="p-4 text-center">
          <p className="text-xs text-slate-600 mb-1">Total</p>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
        </GlassCard>
        <GlassCard className="p-4 text-center bg-green-50">
          <p className="text-xs text-green-700 mb-1">Present</p>
          <p className="text-2xl font-bold text-green-700">{stats.present}</p>
        </GlassCard>
        <GlassCard className="p-4 text-center bg-red-50">
          <p className="text-xs text-red-700 mb-1">Absent</p>
          <p className="text-2xl font-bold text-red-700">{stats.absent}</p>
        </GlassCard>
        <GlassCard className="p-4 text-center bg-yellow-50">
          <p className="text-xs text-yellow-700 mb-1">Late</p>
          <p className="text-2xl font-bold text-yellow-700">{stats.late}</p>
        </GlassCard>
        <GlassCard className="p-4 text-center bg-blue-50">
          <p className="text-xs text-blue-700 mb-1">Excused</p>
          <p className="text-2xl font-bold text-blue-700">{stats.excused}</p>
        </GlassCard>
      </div>

      {/* Attendance Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Student Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-t border-slate-200 hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-900">
                    {student.name}
                    {student.roll_number && (
                      <p className="text-xs text-slate-500">
                        Roll: {student.roll_number}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 flex-wrap">
                      {STATUS_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleStatusChange(student.id, option.value)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                            attendanceData[student.id] === option.value
                              ? `${option.color} ring-2 ring-[#D90429]`
                              : `${option.color} opacity-60 hover:opacity-100`
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleSaveAttendance}
          disabled={isLoading || stats.marked === 0}
          className="flex items-center gap-2 rounded-lg bg-[#D90429] px-6 py-2 font-semibold text-white hover:bg-[#b00320] disabled:opacity-50"
        >
          <Save className="h-5 w-5" />
          Save ({stats.marked}/{stats.total})
        </button>
        <p className="text-sm text-slate-600 self-center">
          {stats.marked} of {stats.total} students marked
        </p>
      </div>
    </div>
  )
}
