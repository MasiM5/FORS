import React, { useEffect, useState } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import { School } from '../types';
import { useAuth } from '../context/AuthContext';
import { Plus, School as SchoolIcon, Trash2, MapPin, Hash } from 'lucide-react';
import { motion } from 'motion/react';

export const SchoolManagement: React.FC = () => {
  const { isAdmin } = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newSchool, setNewSchool] = useState({ name: '', code: '', location: '' });

  const fetchSchools = async () => {
    setLoading(true);
    const snap = await getDocs(query(collection(db, 'schools'), orderBy('name', 'asc')));
    setSchools(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as School)));
    setLoading(false);
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchool.name || !newSchool.code) return;
    try {
      await addDoc(collection(db, 'schools'), {
        ...newSchool,
        createdAt: serverTimestamp()
      });
      setNewSchool({ name: '', code: '', location: '' });
      setIsAdding(false);
      fetchSchools();
    } catch (error) {
      console.error(error);
      alert("Failed to add school.");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete ${name}? Dangerous action.`)) return;
    try {
      await deleteDoc(doc(db, 'schools', id));
      fetchSchools();
    } catch (error) {
      console.error(error);
      alert("Error deleting school. It might have linked students.");
    }
  };

  const inputClasses = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all";
  const labelClasses = "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5";

  if (!isAdmin) return <div className="p-8 text-red-500 font-bold border border-red-100 bg-red-50 rounded-xl">Access Denied: Admins Only.</div>;

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Schools</h1>
          <p className="text-slate-500 text-sm">Manage institutions in Lusangazi District.</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-600/20 text-sm"
          >
            <Plus size={18} />
            Add School
          </button>
        )}
      </header>

      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-card border border-blue-100 shadow-xl shadow-blue-500/5 mb-8"
        >
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={labelClasses}>School Name</label>
              <input 
                required
                value={newSchool.name}
                onChange={e => setNewSchool({...newSchool, name: e.target.value})}
                className={inputClasses}
                placeholder="Example Primary"
              />
            </div>
            <div>
              <label className={labelClasses}>School Code</label>
              <input 
                required
                value={newSchool.code}
                onChange={e => setNewSchool({...newSchool, code: e.target.value})}
                className={inputClasses}
                placeholder="EP001"
              />
            </div>
            <div>
              <label className={labelClasses}>Location</label>
              <input 
                value={newSchool.location}
                onChange={e => setNewSchool({...newSchool, location: e.target.value})}
                className={inputClasses}
                placeholder="Lusangazi District"
              />
            </div>
            <div className="md:col-span-3 flex justify-end gap-3 pt-4 border-t border-slate-50">
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="px-6 py-2 text-slate-500 font-bold text-sm"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-8 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm shadow-lg shadow-blue-600/20"
              >
                Save Institution
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schools.map(school => (
          <div key={school.id} className="group bg-white p-6 rounded-card border border-border-base shadow-sm hover:shadow-xl hover:shadow-slate-500/5 transition-all flex justify-between items-start">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <SchoolIcon size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{school.name}</h3>
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <Hash size={12} className="text-slate-300" />
                    <span>Code: {school.code}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <MapPin size={12} className="text-slate-300" />
                    <span>{school.location || 'Lusangazi District'}</span>
                  </div>
                </div>
              </div>
            </div>
            {isAdmin && (
              <button 
                onClick={() => handleDelete(school.id, school.name)}
                className="p-2 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        ))}
        {!loading && schools.length === 0 && (
          <div className="col-span-full text-center p-20 text-slate-400 bg-white rounded-card border border-dashed border-border-base">
            <SchoolIcon size={48} className="mx-auto mb-4 opacity-10" />
            <p className="font-bold">No schools registered yet.</p>
            <p className="text-sm mt-1">Add your first school to begin administration.</p>
          </div>
        )}
      </div>
    </div>
  );
};
