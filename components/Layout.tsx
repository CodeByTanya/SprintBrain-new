import React from 'react';
import { ViewName, User } from '../types';
import { Button } from './ui';
import { LayoutDashboard, ListTodo, CalendarClock, LogOut } from 'lucide-react';

interface LayoutProps {
  user: User | null;
  currentView: ViewName;
  onNavigate: (view: ViewName) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ user, currentView, onNavigate, onLogout, children }) => {
  // If no user or landing/auth view, render full width
  if (!user || currentView === 'landing' || currentView === 'auth') {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  const navItems: { view: ViewName; label: string; icon: React.ElementType }[] = [
    { view: 'backlog', label: 'Backlog', icon: ListTodo },
    { view: 'planner', label: 'Sprint Planner', icon: CalendarClock },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-10 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2 text-brand-600">
            <LayoutDashboard className="h-6 w-6" />
            <span className="text-xl font-bold tracking-tight">SprintBrain</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentView === item.view 
                  ? 'bg-brand-50 text-brand-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-3 mb-2">
             <div className="h-8 w-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold">
               {user.full_name.charAt(0).toUpperCase()}
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-medium text-gray-900 truncate">{user.full_name}</p>
               <p className="text-xs text-gray-500 truncate">{user.email}</p>
             </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout} className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
            <LogOut className="h-4 w-4 mr-2" />
            Log Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};