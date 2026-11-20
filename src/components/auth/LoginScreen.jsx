import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  UserCheck,
  Globe,
  LifeBuoy,
  CheckCircle2,
  AlertCircle,
  Building2,
  Wrench,
  Database
} from 'lucide-react';
import { demoUsers } from '../../data/authUsers';
import { getSupabaseClient, isSupabaseConfigured } from '../../lib/supabaseClient';

export default function LoginScreen({ onLogin, teamMembers = [] }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isConnectedToCloud = isSupabaseConfigured();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Primary Authentication: Check live Supabase `team_members` table
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data: member, error: dbError } = await supabase
          .from('team_members')
          .select('*')
          .ilike('email', cleanEmail)
          .maybeSingle();

        if (dbError) {
          console.warn('Supabase query error during login:', dbError.message);
        } else if (member) {
          // Verify Password
          if (member.password !== cleanPassword) {
            setIsLoading(false);
            setError('Incorrect password. Please verify your credentials and try again.');
            return;
          }

          // Verify Active Status
          if (member.status === 'Inactive') {
            setIsLoading(false);
            setError('This staff account is currently deactivated. Please contact your administrator.');
            return;
          }

          // Role assignment:
          // Staff with department 'IT Department' or admin receive full features access.
          const lowerRole = (member.role || '').toLowerCase().trim();
          const lowerDept = (member.department || '').toLowerCase().trim();
          const isAdmin =
            cleanEmail.startsWith('admin@') ||
            cleanEmail === 'admin@albazzam.com' ||
            lowerRole === 'admin' ||
            lowerRole === 'administrator' ||
            lowerRole === 'staff director' ||
            lowerDept === 'admin' ||
            lowerRole === 'super admin' ||
            lowerRole === 'system administrator';

          const isITDept =
            lowerDept === 'it' ||
            lowerDept === 'it department' ||
            lowerDept.includes('it department') ||
            lowerDept.startsWith('it') ||
            lowerRole.includes('it support') ||
            lowerRole.includes('software engineer') ||
            lowerRole.includes('it admin') ||
            lowerRole.includes('helpdesk') ||
            cleanEmail.startsWith('support@') ||
            cleanEmail.startsWith('helpdesk@') ||
            lowerRole === 'it_support';

          const isSupport = !isAdmin && isITDept;

          let assignedRole = 'employee';
          let allowedTabs = ['portal', 'tickets',];

          if (isAdmin) {
            assignedRole = 'admin';
            allowedTabs = ['dashboard', 'tickets', 'cms', 'team', 'settings'];
          } else if (isSupport) {
            assignedRole = 'it_support';
            allowedTabs = ['dashboard', 'tickets', 'cms', 'team', 'settings'];
          }

          setIsLoading(false);
          onLogin({
            id: member.id,
            name: member.name,
            email: member.email,
            role: assignedRole,
            roleTitle: member.role || 'Staff Member',
            department: member.department,
            avatar: member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
            badgeColor: isAdmin
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-800'
              : isSupport
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
            allowedTabs
          });
          return;
        }
      }

      // 2. Secondary: Check local in-memory teamMembers
      const foundTeam = teamMembers.find(
        (m) => m.email.toLowerCase() === cleanEmail
      );
      if (foundTeam) {
        if (foundTeam.password && foundTeam.password !== cleanPassword) {
          setIsLoading(false);
          setError('Incorrect password. Please verify your credentials.');
          return;
        }
        const lowerRole = (foundTeam.role || '').toLowerCase().trim();
        const lowerDept = (foundTeam.department || '').toLowerCase().trim();
        const isAdmin =
          cleanEmail.startsWith('admin@') ||
          cleanEmail === 'admin@albazzam.com' ||
          lowerRole === 'admin' ||
          lowerRole === 'administrator' ||
          lowerRole === 'staff director' ||
          lowerDept === 'admin' ||
          lowerRole === 'super admin' ||
          lowerRole === 'system administrator';

        const isITDept =
          lowerDept === 'it' ||
          lowerDept === 'it department' ||
          lowerDept.includes('it department') ||
          lowerDept.startsWith('it') ||
          lowerRole.includes('it support') ||
          lowerRole.includes('software engineer') ||
          lowerRole.includes('it admin') ||
          lowerRole.includes('helpdesk') ||
          cleanEmail.startsWith('support@') ||
          cleanEmail.startsWith('helpdesk@') ||
          lowerRole === 'it_support';

        const isSupport = !isAdmin && isITDept;

        let assignedRole = 'employee';
        let allowedTabs = ['portal', 'tickets', 'facilities'];
        if (isAdmin) {
          assignedRole = 'admin';
          allowedTabs = ['dashboard', 'tickets', 'facilities', 'cms', 'team', 'settings'];
        } else if (isSupport) {
          assignedRole = 'it_support';
          allowedTabs = ['dashboard', 'tickets', 'facilities', 'cms', 'team', 'settings'];
        }

        setIsLoading(false);
        onLogin({
          id: foundTeam.id,
          name: foundTeam.name,
          email: foundTeam.email,
          role: assignedRole,
          roleTitle: foundTeam.role || 'Staff Member',
          department: foundTeam.department,
          avatar: foundTeam.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
          badgeColor: isAdmin
            ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-800'
            : isSupport
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800'
              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
          allowedTabs
        });
        return;
      }

      // 3. Fallback demo users (e.g. system bootstrap admin)
      const foundDemo = demoUsers.find(
        (u) => u.email.toLowerCase() === cleanEmail
      );
      if (foundDemo) {
        if (foundDemo.password && foundDemo.password !== cleanPassword) {
          setIsLoading(false);
          setError('Incorrect password. Please verify your credentials.');
          return;
        }
        setIsLoading(false);
        onLogin(foundDemo);
        return;
      }

      // 4. No account match
      setIsLoading(false);
      setError('No staff account found with this email. Please check the spelling or ask your administrator to register your account.');
    } catch (err) {
      setIsLoading(false);
      setError(`Login failed: ${err.message || 'Network error'}`);
    }
  };

  const handleQuickSelect = (user) => {
    setEmail(user.email);
    setPassword(user.password);
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin(user);
    }, 300);
  };

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row bg-neutral-950 text-white select-none overflow-hidden font-sans">


      {/* Right Column: Authentication Form & One-Click Demo Role Pickers */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 bg-neutral-950 overflow-y-auto py-10">
        <div className="w-full max-w-md mx-auto space-y-6">
          {/* Mobile Logo Header */}
          <div className="flex md:hidden items-center justify-center pb-4 border-b border-neutral-800">
            <img
              src="./logo-dark.png"
              alt="Al Bazzam Facilities Management Group"
              className="h-14 w-auto max-w-[260px] object-contain"
            />
          </div>

          <div className="space-y-4">
            <div className="hidden md:block pb-1">
              <img
                src="./logo-dark.png"
                alt="Al Bazzam Facilities Management Group"
                className="h-14 lg:h-16 w-auto max-w-[280px] object-contain"
              />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Sign in to your corporate account
            </h2>
            <p className="text-xs text-neutral-400">
              Enter your corporate credentials or select a verified demo role below
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            {error && (
              <div className="p-3 rounded bg-rose-950/50 border border-rose-800 text-rose-300 flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="font-semibold text-xs font-mono uppercase text-neutral-300 block mb-1.5">
                Corporate Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
                <input
                  type="email"
                  required
                  placeholder="name@albazzam.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-xs font-mono uppercase text-neutral-300 block mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 bg-neutral-900 border border-neutral-800 rounded text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-neutral-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-400">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" defaultChecked className="rounded border-neutral-700 bg-neutral-900 text-emerald-500 accent-emerald-500" />
                <span>Remember this workstation</span>
              </label>
              <a href="#reset" onClick={(e) => e.preventDefault()} className="text-emerald-400 hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 text-sm"
            >
              <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to Workspace'}</span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Supabase Cloud Auth Status Indicator */}
          <div className="mt-4 pt-4 border-t border-neutral-900 flex items-center justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono border bg-neutral-900/80 border-neutral-800 text-neutral-400">
              <Database className="w-3 h-3 text-emerald-400" />
              <span>Live Cloud Auth: <strong>public.team_members</strong></span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </span>
          </div>


        </div>
      </div>
    </div>
  );
}
