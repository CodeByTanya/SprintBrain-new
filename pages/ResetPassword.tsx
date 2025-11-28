import React, { useState } from 'react';
import { Button, Input, Card } from '../components/ui';
import { supabase } from '../services/supabaseClient';
import { useToast } from '../context/ToastContext';
import { Lock } from 'lucide-react';

interface ResetPasswordProps {
  onSuccess: () => void;
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      showToast('Password updated successfully. You are logged in.', 'success');
      onSuccess(); // Triggers navigation to Backlog in App.tsx
    } catch (error: any) {
      showToast(error.message || 'Failed to update password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md p-8 border-t-4 border-brand-600 shadow-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-100 text-brand-600 mb-4">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Set New Password</h2>
          <p className="text-gray-600 mt-2">
            Please enter a new secure password for your account.
          </p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          <Input 
            label="New Password" 
            type="password" 
            placeholder="••••••••" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
          />

          <Button type="submit" className="w-full" size="lg" isLoading={loading}>
            Update Password
          </Button>
        </form>
      </Card>
    </div>
  );
};