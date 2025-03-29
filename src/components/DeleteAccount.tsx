import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield, Lock } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { supabase } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export function DeleteAccount() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState('');

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (confirmation !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    setLoading(true);

    try {
      // Verify password first
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user?.email!,
        password,
      });

      if (authError) throw new Error('Invalid password');

      // Delete user data
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user?.id);

      if (deleteError) throw deleteError;

      // Delete auth user
      const { error: userError } = await supabase.auth.admin.deleteUser(
        user?.id!
      );

      if (userError) throw userError;

      await signOut();
      toast.success('Account deleted successfully');
      navigate('/');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto mt-8 sm:mt-20 px-4 sm:px-0"
    >
      <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20">
        <div className="text-center mb-8">
          <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Delete Account
          </h2>
          <p className="text-slate-600">
            This action cannot be undone. All your data will be permanently deleted.
          </p>
        </div>

        <div className="bg-amber-50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3 text-amber-700 mb-2">
            <Shield className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">Important</span>
          </div>
          <ul className="text-sm text-amber-700 space-y-2">
            <li>• All your claims and documents will be deleted</li>
            <li>• You won't be able to recover this information</li>
            <li>• Any pending claims will be cancelled</li>
          </ul>
        </div>

        <form onSubmit={handleDelete} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12 h-12"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Type DELETE to confirm
            </label>
            <Input
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              className="h-12"
              required
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => navigate('/settings')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              className="flex-1"
              disabled={loading || confirmation !== 'DELETE'}
            >
              {loading ? 'Deleting...' : 'Delete Account'}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}