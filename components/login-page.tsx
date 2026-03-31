'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/types';
import { motion } from 'motion/react';
import { LogIn, GraduationCap, ShieldCheck, UserCog } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, role);
    } catch (err) {
      setError('Invalid email or role selection. Try: student@webdatax.com, admin@webdatax.com, or super@webdatax.com');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#141414] border border-white/10 rounded-2xl p-8 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
            <LogIn className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">WebDataX</h1>
          <p className="text-white/50 text-sm mt-2 font-mono uppercase tracking-widest">DIT Learning Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Login Role</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'student', icon: GraduationCap, label: 'Student' },
                { id: 'admin', icon: UserCog, label: 'Admin' },
                { id: 'super_admin', icon: ShieldCheck, label: 'Super' }
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id as UserRole)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                    role === r.id 
                      ? 'bg-orange-500/10 border-orange-500 text-orange-500' 
                      : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                  }`}
                >
                  <r.icon className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-bold uppercase">{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. student@webdatax.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-orange-500 transition-colors"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs bg-red-400/10 p-3 rounded-lg border border-red-400/20">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-[0_10px_20px_rgba(249,115,22,0.2)] transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? 'Authenticating...' : 'Enter Dashboard'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-white/30 text-[10px] uppercase tracking-widest">
            BTE-DIT Reference Guide © 2026
          </p>
        </div>
      </motion.div>
    </div>
  );
}
