import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, limit, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Student } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  School as SchoolIcon 
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export const Dashboard: React.FC = () => {
  const { selectedSchool } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    maleStudents: 0,
    femaleStudents: 0,
    activeSchools: 0,
    recentRegistrations: [] as Student[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!selectedSchool) return;
      try {
        const studentQ = query(collection(db, 'students'), where('schoolId', '==', selectedSchool.id));
        const studentsSnap = await getDocs(studentQ);
        const schoolsSnap = await getDocs(collection(db, 'schools'));
        
        const recentQ = query(
          collection(db, 'students'), 
          where('schoolId', '==', selectedSchool.id),
          orderBy('createdAt', 'desc'), 
          limit(6)
        );
        const recentSnap = await getDocs(recentQ);

        const students = studentsSnap.docs.map(doc => doc.data() as Student);
        const totalStudents = students.length;
        const maleStudents = students.filter(s => s.gender === 'Male').length;
        const femaleStudents = students.filter(s => s.gender === 'Female').length;

        setStats({
          totalStudents,
          maleStudents,
          femaleStudents,
          activeSchools: schoolsSnap.size,
          recentRegistrations: recentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student))
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [selectedSchool]);

  const pieData = [
    { name: 'Male', value: stats.maleStudents },
    { name: 'Female', value: stats.femaleStudents },
  ];
  const COLORS = ['#3b82f6', '#ec4899'];

  const statCards = [
    { label: 'Total Registered', value: stats.totalStudents, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Male Learners', value: stats.maleStudents, icon: UserCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Female Learners', value: stats.femaleStudents, icon: UserPlus, color: 'text-pink-600', bg: 'bg-pink-50' },
    { label: 'Active Schools', value: stats.activeSchools, icon: SchoolIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
      {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white rounded-card border border-border-base"></div>)}
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white p-6 rounded-card border border-border-base shadow-sm"
          >
            <div className="stat-label text-text-muted text-[10px] uppercase font-bold tracking-widest mb-1">{card.label}</div>
            <div className="stat-value text-2xl font-bold text-slate-900">{card.value.toLocaleString()}</div>
            <div className={`mt-2 flex items-center gap-1.5 text-xs font-semibold ${card.color}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${card.color.replace('text', 'bg')}`}></div>
              {card.label === 'Active Schools' ? 'Lusangazi District' : `${((card.value / (stats.totalStudents || 1)) * 100).toFixed(1)}% Total`}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-card border border-border-base shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-border-base flex justify-between items-center bg-white sticky top-0 z-10">
            <h3 className="font-bold text-slate-900">Recent Enrollments</h3>
            <button className="text-xs font-bold text-blue-600 hover:underline">View All Records</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-border-base">
                  <th className="px-6 py-3 text-[10px] font-bold text-text-muted uppercase tracking-widest">Pupil ID</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-text-muted uppercase tracking-widest">Full Name</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-text-muted uppercase tracking-widest">Gender</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-text-muted uppercase tracking-widest">Registration Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recentRegistrations.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-blue-600 font-semibold">{student.pupilId}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">{student.fullName}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "status-tag px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        student.gender === 'Male' ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"
                      )}>
                        {student.gender}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Completed</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {stats.recentRegistrations.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-text-muted font-medium italic text-sm">No recent registrations found for this school context.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-card border border-border-base shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-900 mb-6">Distribution Summary</h3>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    fontFamily: 'sans-serif'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4 mt-4">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                  <span className="text-sm font-bold text-slate-700">{d.name} Learners</span>
                </div>
                <div className="text-sm font-black text-slate-900">{d.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
