import { Users, Check, AlertCircle, Percent } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';

export function AttendanceDashboard({ students = [] }) {
  // Calculate attendance stats
  const totalStudents = students.length;
  const presentStudents = students.filter(s => s.marks && s.marks.trim()).length;
  const absentStudents = totalStudents - presentStudents;
  const attendancePercentage = totalStudents > 0 ? Math.round((presentStudents / totalStudents) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Students */}
        <GlassCard className="p-6 border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-semibold">Total Students</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{totalStudents}</p>
            </div>
            <Users className="h-12 w-12 text-blue-600 opacity-20" />
          </div>
        </GlassCard>

        {/* Present */}
        <GlassCard className="p-6 border-l-4 border-l-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-semibold">Present</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{presentStudents}</p>
            </div>
            <Check className="h-12 w-12 text-green-600 opacity-20" />
          </div>
        </GlassCard>

        {/* Absent */}
        <GlassCard className="p-6 border-l-4 border-l-red-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-semibold">Absent</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{absentStudents}</p>
            </div>
            <AlertCircle className="h-12 w-12 text-red-600 opacity-20" />
          </div>
        </GlassCard>

        {/* Attendance % */}
        <GlassCard className="p-6 border-l-4 border-l-[#D90429]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-semibold">Attendance %</p>
              <p className="text-3xl font-bold text-[#D90429] mt-2">{attendancePercentage}%</p>
            </div>
            <Percent className="h-12 w-12 text-[#D90429] opacity-20" />
          </div>
        </GlassCard>
      </div>

      {/* Attendance List */}
      <GlassCard className="p-6 border-t-4 border-t-[#D90429]">
        <h3 className="text-xl font-bold text-[#0A0F2C] mb-6">Student Attendance Status</h3>

        {students.length === 0 ? (
          <p className="text-center text-slate-500 py-8">No students registered yet</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {students.map((student) => {
              const isPresent = student.marks && student.marks.trim();
              return (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-[#D90429] transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-[#0A0F2C]">{student.name}</p>
                    <p className="text-sm text-slate-500">{student.email}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Marks */}
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Marks</p>
                      <p className="text-lg font-bold text-slate-900">
                        {student.marks || '-'}
                      </p>
                    </div>

                    {/* Attendance Badge */}
                    {isPresent ? (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-green-100">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-bold text-green-600">PRESENT</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-red-100">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-bold text-red-600">ABSENT</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>

      {/* Summary Info */}
      <GlassCard className="p-4 bg-blue-50 border-l-4 border-l-blue-600">
        <p className="text-sm text-blue-800">
          <strong>How it works:</strong> Students are automatically marked as <strong>PRESENT</strong> when marks are entered,
          and <strong>ABSENT</strong> if no marks entry exists. The attendance status syncs in real-time across all screens.
        </p>
      </GlassCard>
    </div>
  );
}
