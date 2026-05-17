import { useState, useEffect, useContext } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { PageTransition } from '../components/ui/PageTransition';
import { StudentDashboard } from '../components/StudentDashboard';

export function StudentPortal() {
  const navigate = useNavigate();
  const { data } = useContext(AppContext);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  const isLoggedIn = sessionStorage.getItem('studentAuth') === 'true';

  if (!isLoggedIn) {
    return <Navigate to="/student-login" replace />;
  }

  useEffect(() => {
    // Get student info from sessionStorage
    const studentData = sessionStorage.getItem('student');

    if (!studentData) {
      navigate('/student-login', { replace: true });
      return;
    }

    try {
      const parsedStudent = JSON.parse(studentData);
      setStudent(parsedStudent);
      setLoading(false);
    } catch (err) {
      console.error('Error parsing student data:', err);
      navigate('/student-login', { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('studentAuth');
    sessionStorage.removeItem('studentUser');
    sessionStorage.removeItem('student');
    navigate('/student-login', { replace: true });
  };

  // Get study materials from AppContext
  const materials = Array.isArray(data?.studyMaterials) ? data.studyMaterials : [];

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full border-4 border-slate-700 border-t-[#D90429] animate-spin mb-4"></div>
            <p className="text-slate-600">Loading your portal...</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <StudentDashboard
        student={student}
        materials={materials}
        onLogout={handleLogout}
      />
    </PageTransition>
  );
}
