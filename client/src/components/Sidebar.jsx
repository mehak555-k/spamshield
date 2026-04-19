import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Inbox, ShieldAlert, BarChart3, LogOut, ShieldCheck } from 'lucide-react';

export default function Sidebar() {
  const { logout, user } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Inbox', path: '/inbox', icon: Inbox },
    { name: 'Spam', path: '/spam', icon: ShieldAlert },
    { name: 'Analysis', path: '/analysis', icon: BarChart3 },
  ];

  return (
    <div className="w-64 glass border-r border-white/5 flex flex-col justify-between">
      <div>
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <ShieldCheck className="w-8 h-8 text-blue-500" />
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            SpamShield
          </h2>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-white/5">
        {user && (
          <div className="mb-4 px-4 py-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold text-sm">
              {user.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors border border-transparent hover:border-red-500/20"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
