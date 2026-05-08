
import React, { useState } from 'react';
import { UserRole, UserProfile } from '../types';

interface UserDetailsFormProps {
  role: UserRole;
  onSubmit: (profile: UserProfile) => void;
  onBack: () => void;
}

const UserDetailsForm: React.FC<UserDetailsFormProps> = ({ role, onSubmit, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    teamSize: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Full Name is required';
    if (!formData.company.trim()) newErrors.company = 'Company Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Work Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      
      // Simulate network request to SMTP server
      await new Promise(resolve => setTimeout(resolve, 1500));

      const profile: UserProfile = {
        name: formData.name,
        company: formData.company,
        email: formData.email,
        role: role,
        teamSize: formData.teamSize,
        timestamp: new Date().toISOString(),
      };
      onSubmit(profile);
    }
  };

  const roleLabels: Record<UserRole, string> = {
    REP: 'Sales Representative',
    MANAGER: 'Sales Manager',
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 animate-slide-up relative">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 md:p-10 relative overflow-hidden z-10">
        
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        
        <div className="mb-8">
            <button 
                onClick={onBack}
                disabled={isSubmitting}
                className="text-xs text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold uppercase tracking-wider mb-4 flex items-center gap-1 disabled:opacity-50 transition-colors"
            >
                ← Back to Roles
            </button>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Complete Your Profile</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Accessing as <span className="font-bold text-indigo-600 dark:text-indigo-400">{roleLabels[role]}</span>
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              className={`w-full p-3 rounded-lg border ${errors.name ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-300 dark:border-slate-600 focus:ring-indigo-500'} bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-all duration-200 disabled:opacity-50`}
              placeholder="e.g. Jane Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isSubmitting}
            />
            {errors.name && <p className="text-rose-500 text-xs mt-1 font-medium animate-fade-in">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">
              Company Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              className={`w-full p-3 rounded-lg border ${errors.company ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-300 dark:border-slate-600 focus:ring-indigo-500'} bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-all duration-200 disabled:opacity-50`}
              placeholder="e.g. Acme Corp"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              disabled={isSubmitting}
            />
            {errors.company && <p className="text-rose-500 text-xs mt-1 font-medium animate-fade-in">{errors.company}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">
              Work Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              className={`w-full p-3 rounded-lg border ${errors.email ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-300 dark:border-slate-600 focus:ring-indigo-500'} bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-all duration-200 disabled:opacity-50`}
              placeholder="name@company.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={isSubmitting}
            />
            {errors.email && <p className="text-rose-500 text-xs mt-1 font-medium animate-fade-in">{errors.email}</p>}
          </div>

          {(role === 'MANAGER') && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">
                Team Size (Optional)
              </label>
              <select
                className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800 transition-all duration-200 disabled:opacity-50"
                value={formData.teamSize}
                onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                disabled={isSubmitting}
              >
                <option value="">Select size...</option>
                <option value="1-10">1-10 Reps</option>
                <option value="11-50">11-50 Reps</option>
                <option value="50+">50+ Reps</option>
              </select>
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 font-bold rounded-lg shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 ${
                  isSubmitting 
                  ? 'bg-slate-300 dark:bg-slate-600 cursor-wait text-slate-500 dark:text-slate-300' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-500/30'
              }`}
            >
              {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending Details...
                  </>
              ) : "Verify & Enter Dashboard"}
            </button>
            <p className="text-center text-[10px] text-slate-400 mt-4">
              Your analysis remains private to your selected role.
            </p>
          </div>
        </form>
      </div>

      <div className="absolute bottom-6 font-extrabold text-lg text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
        &copy; 2026 Akash Krishna All rights reserved
      </div>
    </div>
  );
};

export default UserDetailsForm;
