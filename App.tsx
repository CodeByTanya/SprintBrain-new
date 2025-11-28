import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { Backlog } from './pages/Backlog';
import { SprintPlanner } from './pages/SprintPlanner';
import { ResetPassword } from './pages/ResetPassword';
import { ViewName, User } from './types';
import { supabase } from './services/supabaseClient';
import { ToastProvider, useToast } from './context/ToastContext';

// Inner App component to use Toast Context
const AppContent = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewName>('landing');
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    // 1. Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          full_name: session.user.user_metadata.full_name || session.user.email?.split('@')[0],
        });
        setView('backlog');
      }
      setLoading(false);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth Event:', event);
      
      if (event === 'PASSWORD_RECOVERY') {
        // Handle password recovery link click
        setView('reset-password');
      } else if (event === 'SIGNED_IN' && session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          full_name: session.user.user_metadata.full_name || session.user.email?.split('@')[0],
        });
        // If we are on reset-password, stay there, otherwise go to backlog
        setView((prev) => prev === 'reset-password' ? 'reset-password' : 'backlog');
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setView('landing');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showToast('Error logging out', 'error');
    } else {
      showToast('Logged out successfully', 'info');
    }
  };

  const renderView = () => {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        </div>
      );
    }

    switch (view) {
      case 'landing':
        return <Landing onGetStarted={() => setView('auth')} />;
      case 'auth':
        return <Auth onSuccess={() => {/* Handled by onAuthStateChange */}} />;
      case 'reset-password':
        return <ResetPassword onSuccess={() => setView('backlog')} />;
      case 'backlog':
        return user ? <Backlog /> : <Auth onSuccess={() => {}} />;
      case 'planner':
        return user ? <SprintPlanner /> : <Auth onSuccess={() => {}} />;
      default:
        return <Landing onGetStarted={() => setView('auth')} />;
    }
  };

  return (
    <Layout 
      user={user} 
      currentView={view} 
      onNavigate={setView} 
      onLogout={handleLogout}
    >
      {renderView()}
    </Layout>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}