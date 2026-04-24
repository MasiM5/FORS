import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserPlus, CheckCircle2, AlertCircle, School, CreditCard, Calendar, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const StudentRegistration: React.FC = () => {
  const { profile, selectedSchool } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    gender: 'Male',
    dateOfBirth: '',
    nrcNumber: '',
    contactNumber: '',
    physicalAddress: '',
    previousSchool: '',
  });

  const generatePupilId = async () => {
    const year = new Date().getFullYear().toString().slice(-2);
    const schoolCode = selectedSchool?.code || 'XXX';
    const random = Math.floor(1000 + Math.random() * 9000);
    return `F1-${year}-${schoolCode}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchool) {
      setError("Please select a school context first.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const pupilId = await generatePupilId();
      await addDoc(collection(db, 'students'), {
        ...formData,
        pupilId,
        schoolId: selectedSchool.id,
        schoolName: selectedSchool.name,
        registrarId: profile?.uid,
        registrarName: profile?.fullName,
        createdAt: serverTimestamp(),
        status: 'Registered'
      });

      setSuccess(true);
      setTimeout(() => navigate('/students'), 2000);
    } catch (err) {
      console.error(err);
      setError('Failed to register student. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400";
  const labelClasses = "block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1";

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Learner Registration</h1>
          <p className="text-slate-500 mt-1">Enrollment for {selectedSchool?.name}</p>
        </div>
      </div>

      {success ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-50 border border-green-200 p-12 rounded-3xl text-center space-y-4"
        >
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto shadow-lg shadow-green-500/20">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-xl font-bold text-green-900">Registration Successful!</h2>
          <p className="text-green-700">The learner has been added to {selectedSchool?.name}. Redirecting to records...</p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-card border border-border-base shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-border-base bg-slate-50/50 flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <User size={18} />
              </div>
              <h3 className="font-bold text-slate-900">Personal Information</h3>
            </div>
            
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className={labelClasses}>Full Name of Learner</label>
                <input
                  type="text"
                  required
                  className={inputClasses}
                  placeholder="Enter full legal name"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              <div>
                <label className={labelClasses}>Gender</label>
                <select
                  className={inputClasses}
                  value={formData.gender}
                  onChange={e => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className={labelClasses}>Date of Birth</label>
                <input
                  type="date"
                  required
                  className={inputClasses}
                  value={formData.dateOfBirth}
                  onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
              </div>

              <div>
                <label className={labelClasses}>ID / NRC Number (Optional)</label>
                <input
                  type="text"
                  className={inputClasses}
                  placeholder="e.g. 123456/78/9"
                  value={formData.nrcNumber}
                  onChange={e => setFormData({ ...formData, nrcNumber: e.target.value })}
                />
              </div>

              <div>
                <label className={labelClasses}>Primary Contact Number</label>
                <input
                  type="tel"
                  required
                  className={inputClasses}
                  placeholder="e.g. 097..."
                  value={formData.contactNumber}
                  onChange={e => setFormData({ ...formData, contactNumber: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-card border border-border-base shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-border-base bg-slate-50/50 flex items-center gap-3">
              <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                <School size={18} />
              </div>
              <h3 className="font-bold text-slate-900">Academic Context</h3>
            </div>
            
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 text-sm text-slate-500 bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                <AlertCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
                <p>This registration will be automatically linked to <strong>{selectedSchool?.name}</strong>. This cannot be changed after submission.</p>
              </div>

              <div className="md:col-span-2">
                <label className={labelClasses}>Previous Primary School</label>
                <input
                  type="text"
                  required
                  className={inputClasses}
                  placeholder="Name of primary school previously attended"
                  value={formData.previousSchool}
                  onChange={e => setFormData({ ...formData, previousSchool: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClasses}>Home Address</label>
                <textarea
                  required
                  rows={2}
                  className={inputClasses}
                  placeholder="Current residential address in Lusangazi"
                  value={formData.physicalAddress}
                  onChange={e => setFormData({ ...formData, physicalAddress: e.target.value })}
                />
              </div>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3 text-sm font-semibold"
              >
                <AlertCircle size={18} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-end gap-4 p-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-3 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 transition-all active:scale-95"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Complete Registration
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
