import React, { useState } from 'react';
import { Button, Input, Card } from '../components/ui';
import { supabase } from '../services/supabaseClient';
import { useToast } from '../context/ToastContext';
import { User } from '../types';
import { Mail, Lock, User as UserIcon, ArrowLeft } from 'lucide-react';

interface AuthProps {
  onSuccess: (user: User) => void;
}

type AuthMode = 'signin' | 'signup' | 'forgot_password';

export const Auth: React.FC<AuthProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });

        if (error) throw error;

        // Automatically handle success without asking for email verification
        if (data.session) {
          showToast('Account created successfully!', 'success');
          onSuccess({
            id: data.user!.id,
            email: data.user!.email!,
            full_name: data.user!.user_metadata.full_name,
          });
        } else {
           // Fallback: If backend requires verification but we want to skip the UI step
           // We try to sign in immediately. If it fails, we default to signin screen.
           const { data: signInData } = await supabase.auth.signInWithPassword({
              email,
              password,
           });

           if (signInData?.session) {
              showToast('Account created successfully!', 'success');
              onSuccess({
                id: signInData.user.id,
                email: signInData.user.email!,
                full_name: signInData.user.user_metadata.full_name,
              });
           } else {
              showToast('Account created. Please sign in.', 'success');
              setMode('signin');
           }
        }
      } else if (mode === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          showToast('Logged in successfully', 'success');
          // State update handled by onAuthStateChange in App.tsx
        }
      } else if (mode === 'forgot_password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) throw error;

        showToast('Password reset link sent to your email.', 'success');
        setMode('signin');
      }
    } catch (error: any) {
      showToast(error.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderTitle = () => {
    switch (mode) {
      case 'signin': return 'Welcome Back';
      case 'signup': return 'Create Account';
      case 'forgot_password': return 'Reset Password';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md p-8 shadow-xl border-t-4 border-brand-600">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">{renderTitle()}</h2>
          <p className="text-gray-600 mt-2 text-sm">
            {mode === 'signup' ? 'Start planning smarter sprints today' : 
             mode === 'forgot_password' ? 'Enter your email to receive a reset link' :
             'Sign in to your SprintBrain account'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          {mode === 'signup' && (
            <div className="relative">
              <UserIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input 
                type="text" 
                placeholder="Full Name" 
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input 
              type="email" 
              placeholder="name@company.com" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {(mode === 'signin' || mode === 'signup') && (
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input 
                type="password" 
                placeholder="••••••••" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          <Button type="submit" className="w-full shadow-sm" size="lg" isLoading={loading}>
            {mode === 'signin' ? 'Sign In' : 
             mode === 'signup' ? 'Create Account' : 
             'Send Reset Link'}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-center gap-3 text-sm text-gray-600">
          {mode === 'signin' && (
            <>
              <button onClick={() => setMode('forgot_password')} className="text-brand-600 hover:text-brand-700 font-medium">
                Forgot password?
              </button>
              <div className="flex gap-1">
                Don't have an account? 
                <button onClick={() => setMode('signup')} className="font-semibold text-brand-600 hover:text-brand-700">
                  Sign up
                </button>
              </div>
            </>
          )}

          {(mode === 'signup' || mode === 'forgot_password') && (
            <button onClick={() => setMode('signin')} className="flex items-center text-gray-500 hover:text-gray-900 font-medium">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Sign In
            </button>
          )}
        </div>
      </Card>
    </div>
  );
};