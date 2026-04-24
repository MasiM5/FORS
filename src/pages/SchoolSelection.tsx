import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { School } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { School as SchoolIcon, ArrowRight, GraduationCap } from 'lucide-react';
import { motion } from 'motion/react';

export const SchoolSelection: React.FC = () => {
  const { profile, isAdmin, setSelectedSchool } = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        if (isAdmin) {
          const snap = await getDocs(collection(db, 'schools'));
          setSchools(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as School)));
        } else if (profile?.schoolId) {
          const snap = await getDoc(doc(db, 'schools', profile.schoolId));
          if (snap.exists()) {
            setSchools([{ id: snap.id, ...snap.data() } as School]);
          }
        }
      } catch (error) {
        console.error("Error fetching schools:", error);
      } finally {
        setLoading(false);
      }
    };

    if (profile) fetchSchools();
  }, [profile, isAdmin]);

  const handleSelect = (school: School) => {
    setSelectedSchool(school);
    navigate('/');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading schools...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex p-3 bg-blue-600 rounded-xl text-white mb-4">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Select System Context</h1>
          <p className="text-slate-500">Please choose a school to manage enrollment data.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schools.map((school) => (
            <button
              key={school.id}
              onClick={() => handleSelect(school)}
              className="group bg-white p-6 rounded-2xl border border-slate-200 text-left hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 transition-all flex flex-col justify-between h-full"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 mb-4 transition-colors">
                  <SchoolIcon size={20} />
                </div>
                <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{school.name}</h3>
                <p className="text-sm text-slate-500 mt-1">Code: {school.code}</p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                Select School <ArrowRight size={16} />
              </div>
            </button>
          ))}
          {schools.length === 0 && (
            <div className="col-span-full bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center space-y-4">
              <p className="text-slate-400 font-medium">No schools assigned to your account or registered in the district.</p>
              {isAdmin && (
                <button
                  onClick={() => navigate('/schools')}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                >
                  Go to Schools Management
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
