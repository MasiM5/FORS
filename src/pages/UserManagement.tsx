import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, School, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { UserCog, ShieldCheck, Mail, Building, Save, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export const UserManagement: React.FC = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAdmin) return;
      try {
        const usersSnap = await getDocs(query(collection(db, 'users'), orderBy('email', 'asc')));
        const schoolsSnap = await getDocs(collection(db, 'schools'));
        setUsers(usersSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));
        setSchools(schoolsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as School)));
      } catch (err) {
        console.error("Failed to fetch user management data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAdmin]);

  const handleUpdate = async (uid: string, role: UserRole, schoolId?: string) => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { 
        role, 
        schoolId: role === 'admin' ? null : schoolId 
      });
      alert('User updated successfully.');
    } catch (error) {
      alert('Failed to update user.');
    }
  };

  if (!isAdmin) return <div className="p-8 text-red-500 font-bold border border-red-100 bg-red-50 rounded-xl">Access Denied: Admins Only.</div>;

  return (
    <div className="space-y-6 max-w-6xl animate-in fade-in duration-500">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">User Governance</h1>
        <p className="text-slate-500 text-sm">Assign roles and school access to system operators.</p>
      </header>

      <div className="bg-white rounded-card border border-border-base shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-border-base">
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">System User</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Access Role</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">School Linkage</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right">Commit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.uid} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-bold">
                        {user.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{user.fullName}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <Mail size={10} /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <select
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={user.role}
                      onChange={(e) => {
                        const newUsers = users.map(u => u.uid === user.uid ? { ...u, role: e.target.value as UserRole } : u);
                        setUsers(newUsers);
                      }}
                    >
                      <option value="clerk">Registrar Clerk</option>
                      <option value="school_admin">School Authority</option>
                      <option value="admin">District Administrator</option>
                    </select>
                  </td>
                  <td className="px-6 py-5">
                    <select
                      disabled={user.role === 'admin'}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-30"
                      value={user.schoolId || ''}
                      onChange={(e) => {
                        const newUsers = users.map(u => u.uid === user.uid ? { ...u, schoolId: e.target.value } : u);
                        setUsers(newUsers);
                      }}
                    >
                      <option value="">Global District Access</option>
                      {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button
                      onClick={() => handleUpdate(user.uid, user.role, user.schoolId)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all shadow-sm border border-transparent hover:border-blue-100"
                    >
                      <Save size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-100 p-6 rounded-card flex gap-4">
        <AlertCircle className="text-blue-600 shrink-0" size={20} />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-blue-900">Isolation Security Rule</h4>
          <p className="text-xs text-blue-700 leading-relaxed">
            School Authorities and Registrar Clerks are strictly isolated to their linked school. 
            District Administrators have global access and can manually switch contexts in the dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};
