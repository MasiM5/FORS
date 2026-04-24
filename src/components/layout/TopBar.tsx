import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, LogOut } from 'lucide-react';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';

export const TopBar: React.FC = () => {
  const { profile, selectedSchool } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-[72px] bg-white border-b border-border-base flex items-center justify-between px-8 fixed top-0 right-0 left-[260px] z-40">
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider text-[10px]">Context</span>
        <h2 className="text-lg font-bold text-slate-900 -mt-1">
          {selectedSchool ? selectedSchool.name : 'Lusangazi District Oversight'}
        </h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end">
          <span className="text-sm font-bold text-slate-900">{profile?.fullName}</span>
          <span className="text-xs text-slate-500 capitalize">{profile?.role.replace('_', ' ')}</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-slate-400">
          <User size={20} />
        </div>
      </div>
    </header>
  );
};
