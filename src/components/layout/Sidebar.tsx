import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Users, 
  School as SchoolIcon, 
  FilePlus, 
  LogOut, 
  LayoutDashboard,
  Settings,
  History,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export const Sidebar: React.FC = () => {
  const { profile, isAdmin, selectedSchool, setSelectedSchool } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/students', icon: Users, label: 'Student Records' },
    { to: '/register', icon: FilePlus, label: 'Learner Registration' },
  ];

  if (isAdmin) {
    navItems.push({ to: '/schools', icon: SchoolIcon, label: 'Schools Management' });
    navItems.push({ to: '/users', icon: Settings, label: 'User Management' });
  }

  if (isAdmin) {
    navItems.push({ to: '/logs', icon: History, label: 'Audit Logs' });
  }

  return (
    <aside className="w-[260px] bg-sidebar-bg text-white min-h-screen flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 mb-8 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
          <GraduationCap size={20} className="text-white" />
        </div>
        <span className="font-bold text-lg">Form One Admin</span>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                isActive 
                  ? "bg-[#1e293b] text-white" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )
            }
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        {isAdmin && (
          <button
            onClick={() => {
              setSelectedSchool(null);
              navigate('/select-school');
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all text-sm mb-2"
          >
            <SchoolIcon size={18} />
            <span>Switch School</span>
          </button>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-all text-sm"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
