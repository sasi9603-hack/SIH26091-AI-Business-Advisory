import React, { useState } from 'react';
import { EntrepreneurProfile, BusinessCategory, SocialCategory } from '../types';
import { CATEGORY_LABELS } from '../services/mockData';
import { X, Check, MapPin, IndianRupee, User, Building2 } from 'lucide-react';

interface InputWizardProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: EntrepreneurProfile;
  onSaveProfile: (profile: EntrepreneurProfile) => void;
}

export const InputWizard: React.FC<InputWizardProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onSaveProfile
}) => {
  const [profile, setProfile] = useState<EntrepreneurProfile>(currentProfile);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(profile);
    onClose();
  };

  const budgetChips = [50000, 100000, 200000, 500000, 1000000];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-sbi-border w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-sbi-indigo text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-sbi-yellow" />
            <div>
              <h2 className="text-base font-bold">Configure Business &amp; Location Profile</h2>
              <p className="text-xs text-slate-300">Parameters used to calculate local competition and scheme subsidies</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white transition rounded p-1 hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-sm">
          {/* Location Section */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
            <h3 className="font-bold text-sbi-navy flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-sbi-blue" />
              <span>Target Location (Rural PIN / Village)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Postal PIN Code *</label>
                <input
                  type="text"
                  value={profile.pincode}
                  onChange={(e) => setProfile({ ...profile, pincode: e.target.value })}
                  placeholder="e.g. 522002"
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-sm focus:border-sbi-blue focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Village / Town Name *</label>
                <input
                  type="text"
                  value={profile.villageTown}
                  onChange={(e) => setProfile({ ...profile, villageTown: e.target.value })}
                  placeholder="e.g. Guntur Rural"
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-sm focus:border-sbi-blue focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">District</label>
                <input
                  type="text"
                  value={profile.district}
                  onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-sm focus:border-sbi-blue focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Area Classification</label>
                <select
                  value={profile.isRural ? 'rural' : 'urban'}
                  onChange={(e) => setProfile({ ...profile, isRural: e.target.value === 'rural' })}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-sm focus:border-sbi-blue focus:outline-none"
                >
                  <option value="rural">Rural (Eligible for 35% PMEGP Subsidy)</option>
                  <option value="urban">Urban (Eligible for 25% PMEGP Subsidy)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Business Category & Budget */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
            <h3 className="font-bold text-sbi-navy flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <IndianRupee className="w-4 h-4 text-emerald-600" />
              <span>Proposed Enterprise &amp; Capital</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Business Category</label>
                <select
                  value={profile.category}
                  onChange={(e) => setProfile({ ...profile, category: e.target.value as BusinessCategory })}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-sm focus:border-sbi-blue focus:outline-none"
                >
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Available Personal Equity (₹)</label>
                <input
                  type="number"
                  value={profile.availableCapital}
                  onChange={(e) => setProfile({ ...profile, availableCapital: Math.max(10000, Number(e.target.value)) })}
                  step="10000"
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-sm focus:border-sbi-blue focus:outline-none font-semibold text-sbi-navy"
                  required
                />
              </div>
            </div>

            {/* Quick Capital Selection Chips */}
            <div>
              <span className="text-[11px] text-slate-500 font-semibold block mb-1.5">Quick Select Capital:</span>
              <div className="flex flex-wrap gap-1.5">
                {budgetChips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setProfile({ ...profile, availableCapital: chip })}
                    className={`px-2.5 py-1 rounded text-xs font-medium border transition ${
                      profile.availableCapital === chip
                        ? 'bg-sbi-blue text-white border-sbi-blue font-bold shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    ₹{(chip / 1000).toLocaleString('en-IN')}k
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Demographic Profile for Subsidies */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
            <h3 className="font-bold text-sbi-navy flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <User className="w-4 h-4 text-purple-600" />
              <span>Demographic Profile (For Subsidy Matching)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Social Category</label>
                <select
                  value={profile.socialCategory}
                  onChange={(e) => setProfile({ ...profile, socialCategory: e.target.value as SocialCategory })}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-sm focus:border-sbi-blue focus:outline-none"
                >
                  <option value="GENERAL">General</option>
                  <option value="OBC">OBC (Special Subsidy)</option>
                  <option value="SC">SC (Special Subsidy)</option>
                  <option value="ST">ST (Special Subsidy)</option>
                  <option value="MINORITY">Minority (Special Subsidy)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Gender</label>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value as 'MALE' | 'FEMALE' | 'OTHER' })}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-sm focus:border-sbi-blue focus:outline-none"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female (Eligible for Stand-Up India &amp; Special Subsidy)</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Applicant Age</label>
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
                  min="18"
                  max="70"
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-sm focus:border-sbi-blue focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 rounded bg-white hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-sbi-indigo hover:bg-purple-950 rounded shadow flex items-center gap-1.5 transition active:scale-95"
            >
              <Check className="w-4 h-4 text-sbi-yellow" />
              <span>Apply &amp; Recalculate Advisory</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
