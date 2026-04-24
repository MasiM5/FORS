import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, where, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Student } from '../types';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, Trash2, Edit2, MoreVertical, Download, UserX, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export const StudentList: React.FC = () => {
  const { isAdmin, selectedSchool } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState('All');

  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedSchool) return;
      try {
        setLoading(true);
        // CRITICAL: Strict school-based filtering at the query level
        const q = query(
          collection(db, 'students'), 
          where('schoolId', '==', selectedSchool.id),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const studentData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Student));
        setStudents(studentData);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedSchool]);

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         s.pupilId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGender = filterGender === 'All' || s.gender === filterGender;
    return matchesSearch && matchesGender;
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'students', id));
        setStudents(prev => prev.filter(s => s.id !== id));
      } catch (error) {
        alert('Failed to delete student.');
      }
    }
  };

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Pupil ID,Full Name,Gender,Previous School,Address\n"
      + filteredStudents.map(s => `"${s.pupilId}","${s.fullName}","${s.gender}","${s.previousSchool}","${s.physicalAddress}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `learners_${selectedSchool?.code}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Student Records</h1>
          <p className="text-slate-500 mt-1">Managing {students.length} enrollment(s) at {selectedSchool?.name}</p>
        </div>
        <button
          onClick={exportData}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm active:scale-95"
        >
          <Download size={16} /> Export Records
        </button>
      </div>

      <div className="bg-white p-4 rounded-card border border-border-base shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or Pupil ID..."
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select
            className="flex-1 md:w-40 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-blue-500"
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
          >
            <option value="All">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-400">
            <Filter size={18} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-card border border-border-base shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-border-base">
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center w-16">#</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Pupil ID</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Full Name</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Gender</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Previous School</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-6 h-16 bg-slate-50/50"></td>
                    </tr>
                  ))
                ) : (
                  filteredStudents.map((student, idx) => (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-xs font-bold text-slate-400 text-center">{idx + 1}</td>
                      <td className="px-6 py-4 text-sm font-mono font-bold text-blue-600">{student.pupilId}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-900">{student.fullName}</div>
                        <div className="text-xs text-slate-500 font-medium">Lusangazi District</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                          student.gender === 'Male' ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"
                        )}>
                          {student.gender}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">{student.previousSchool}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                            <Edit2 size={16} />
                          </button>
                          {(isAdmin) && (
                            <button 
                              onClick={() => handleDelete(student.id!)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
          {!loading && filteredStudents.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mb-4">
                <UserX size={32} />
              </div>
              <h3 className="text-slate-900 font-bold">No Records Found</h3>
              <p className="text-slate-500 text-sm max-w-xs mt-1">We couldn't find any learners matching your criteria for {selectedSchool?.name}.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
