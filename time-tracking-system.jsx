import React, { useState } from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

const TimeTrackingSystem = () => {
  // Initial project data based on the Excel file
  const initialProjects = [
    { id: 1, name: 'פרויקט DATABASE', allocatedHours: 197, isGlobal: false },
    { id: 2, name: 'פרויקט CRM', allocatedHours: 142, isGlobal: false },
    { id: 3, name: 'פרויקט Backend', allocatedHours: 125, isGlobal: false },
    { id: 4, name: 'טיפול בבאגים', allocatedHours: null, isGlobal: true },
    { id: 5, name: 'זמן לימוד', allocatedHours: null, isGlobal: true },
    { id: 6, name: 'העלאת גרסה', allocatedHours: null, isGlobal: true },
  ];

  const days = [
    { key: 'sunday', label: 'ראשון', date: '1.2.26' },
    { key: 'monday', label: 'שני', date: '2.2.26' },
    { key: 'tuesday', label: 'שלישי', date: '3.2.26' },
    { key: 'wednesday', label: 'רביעי', date: '4.2.26' },
    { key: 'thursday', label: 'חמישי', date: '5.2.26' },
  ];

  // Attendance hours for each day (from clock-in/out system)
  const [attendanceHours] = useState({
    sunday: 9.32,
    monday: 8.45,
    tuesday: 7.45,
    wednesday: 10.2,
    thursday: 8.45,
  });

  // Initialize hours state - projectId -> day -> hours
  const [projectHours, setProjectHours] = useState(() => {
    const initial = {};
    initialProjects.forEach(project => {
      initial[project.id] = {
        sunday: project.id === 1 ? 2.0 : project.id === 2 ? 4.2 : project.id === 3 ? 3.21 : 0,
        monday: project.id === 1 ? 4.0 : project.id === 2 ? 4.45 : 0,
        tuesday: 0,
        wednesday: 0,
        thursday: 0,
      };
    });
    return initial;
  });

  // Calculate total reported hours for a project
  const getTotalReportedHours = (projectId) => {
    return Object.values(projectHours[projectId] || {}).reduce((sum, hours) => sum + (parseFloat(hours) || 0), 0);
  };

  // Calculate remaining hours for a project
  const getRemainingHours = (project) => {
    if (project.isGlobal) return null;
    const reported = getTotalReportedHours(project.id);
    return project.allocatedHours - reported;
  };

  // Calculate daily totals
  const getDailyTotal = (day) => {
    return initialProjects.reduce((sum, project) => {
      return sum + (parseFloat(projectHours[project.id]?.[day]) || 0);
    }, 0);
  };

  // Check if daily total matches attendance
  const isDailyValid = (day) => {
    const total = getDailyTotal(day);
    const attendance = attendanceHours[day];
    return Math.abs(total - attendance) < 0.01; // Account for floating point precision
  };

  // Handle hour input change
  const handleHourChange = (projectId, day, value) => {
    setProjectHours(prev => ({
      ...prev,
      [projectId]: {
        ...prev[projectId],
        [day]: value === '' ? 0 : parseFloat(value) || 0,
      },
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-800">מערכת דיווח שעות</h1>
          </div>
          <p className="text-slate-600 text-sm">שלום רועי, נא הקפד לדווח כל יום</p>
        </div>

        {/* Main Grid */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <th className="px-4 py-4 text-right font-semibold border-l border-blue-500">שם הפרויקט</th>
                  <th className="px-4 py-4 text-center font-semibold border-l border-blue-500">סך הכל שעות<br/>שהוקצו</th>
                  {days.map(day => (
                    <th key={day.key} className="px-4 py-4 text-center font-semibold border-l border-blue-500">
                      <div>{day.label}</div>
                      <div className="text-xs font-normal opacity-90">{day.date}</div>
                    </th>
                  ))}
                  <th className="px-4 py-4 text-center font-semibold">סך הכל שעות<br/>מדווחות</th>
                  <th className="px-4 py-4 text-center font-semibold">שעות שנותרו</th>
                </tr>
              </thead>
              <tbody>
                {initialProjects.map((project, idx) => (
                  <tr 
                    key={project.id} 
                    className={`${idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'} hover:bg-blue-50 transition-colors ${project.isGlobal ? 'bg-amber-50 hover:bg-amber-100' : ''}`}
                  >
                    <td className="px-4 py-3 text-right font-medium border-l border-slate-200">
                      {project.isGlobal && <span className="text-amber-600 text-xs mr-2">●</span>}
                      {project.name}
                    </td>
                    <td className="px-4 py-3 text-center border-l border-slate-200">
                      {project.allocatedHours !== null ? (
                        <span className="font-semibold text-slate-700">{project.allocatedHours}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    {days.map(day => (
                      <td key={day.key} className="px-2 py-3 text-center border-l border-slate-200">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={projectHours[project.id]?.[day.key] || ''}
                          onChange={(e) => handleHourChange(project.id, day.key, e.target.value)}
                          className="w-20 px-2 py-1 text-center border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0"
                        />
                      </td>
                    ))}
                    <td className="px-4 py-3 text-center font-semibold text-blue-700 border-l border-slate-200">
                      {getTotalReportedHours(project.id).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold">
                      {project.isGlobal ? (
                        <span className="text-slate-400">-</span>
                      ) : (
                        <span className={getRemainingHours(project) < 0 ? 'text-red-600' : 'text-green-600'}>
                          {getRemainingHours(project).toFixed(2)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

                {/* Separator */}
                <tr className="bg-slate-200">
                  <td colSpan="9" className="py-1"></td>
                </tr>

                {/* Daily Totals Row */}
                <tr className="bg-slate-100 font-bold">
                  <td className="px-4 py-4 text-right border-l border-slate-300" colSpan="2">
                    סך הכל דיווח יומי
                  </td>
                  {days.map(day => (
                    <td 
                      key={day.key} 
                      className={`px-4 py-4 text-center border-l border-slate-300 text-lg font-bold transition-colors ${
                        isDailyValid(day.key) 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {isDailyValid(day.key) ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <AlertCircle className="w-5 h-5" />
                        )}
                        {getDailyTotal(day.key).toFixed(2)}
                      </div>
                    </td>
                  ))}
                  <td colSpan="2"></td>
                </tr>

                {/* Attendance Hours Row */}
                <tr className="bg-blue-50">
                  <td className="px-4 py-3 text-right font-semibold border-l border-slate-300" colSpan="2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      שעות דיווח יומי (נוכחות)
                    </div>
                  </td>
                  {days.map(day => (
                    <td key={day.key} className="px-4 py-3 text-center font-semibold text-slate-700 border-l border-slate-300">
                      {attendanceHours[day.key].toFixed(2)}
                    </td>
                  ))}
                  <td colSpan="2"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">מקרא</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-800">תקין</div>
                <div className="text-sm text-slate-600">שעות דיווח = נוכחות</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-800">אי התאמה</div>
                <div className="text-sm text-slate-600">יש לתקן את הדיווח</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl text-amber-600">●</span>
              </div>
              <div>
                <div className="font-semibold text-slate-800">פרויקטים גלובליים</div>
                <div className="text-sm text-slate-600">ללא מכסת שעות</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeTrackingSystem;
