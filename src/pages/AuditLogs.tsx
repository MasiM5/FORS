import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { AuditLog } from '../types';
import { useAuth } from '../context/AuthContext';
import { History, User, Clock, Activity } from 'lucide-react';
import { format } from 'date-fns';

export const AuditLogs: React.FC = () => {
  const { isAdmin } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(100));
      const snap = await getDocs(q);
      setLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditLog)));
      setLoading(false);
    };
    if (isAdmin) fetchLogs();
  }, [isAdmin]);

  if (!isAdmin) return <div className="p-8">Access Denied.</div>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Audit Logs</h1>
        <p className="text-slate-500 mt-1">Review system activities and user actions.</p>
      </header>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden text-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider">Action</th>
                <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors italic">
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500 flex items-center gap-2">
                    <Clock size={14} />
                    {log.timestamp?.toDate ? format(log.timestamp.toDate(), 'yyyy-MM-dd HH:mm:ss') : 'Just now'}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-slate-400" />
                      {log.userName}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-tight">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 max-w-md truncate">
                    {log.details}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    No activity logs recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
