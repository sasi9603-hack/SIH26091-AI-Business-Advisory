import React, { useState } from 'react';
import { EntrepreneurProfile, BusinessCategory } from '../types';
import { CATEGORY_LABELS } from '../services/mockData';
import { evaluateSIHScheme } from '../services/sihSchemes';
import { geocodeLocation } from '../services/api';
import { X, Check, MapPin, IndianRupee, Building2, Compass, Loader2 } from 'lucide-react';

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
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [resolvedAddress, setResolvedAddress] = useState<string>(
    currentProfile.lat && currentProfile.lng 
      ? `${currentProfile.villageTown || currentProfile.district} [${currentProfile.lat.toFixed(4)}°N, ${currentProfile.lng.toFixed(4)}°E]`
      : ''
  );

  if (!isOpen) return null;

  const handleResolveCoordinates = async () => {
    setIsGeocoding(true);
    try {
      const geo = await geocodeLocation({
        villageTown: profile.villageTown,
        block: profile.block,
        district: profile.district,
        state: profile.state,
        pincode: profile.pincode
      });
      setProfile((prev) => ({
        ...prev,
        lat: geo.latitude,
        lng: geo.longitude,
        district: prev.district || geo.district,
        state: prev.state || geo.state,
        pincode: prev.pincode || geo.pincode
      }));
      setResolvedAddress(`${geo.displayName || geo.formattedAddress} (${geo.latitude.toFixed(4)}°N, ${geo.longitude.toFixed(4)}°E)`);
    } catch (err) {
      console.error('Geocoding error:', err);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeocoding(true);

    try {
      // 1. Resolve geographic coordinates via real geocode API
      const geo = await geocodeLocation({
        villageTown: profile.villageTown,
        block: profile.block,
        district: profile.district,
        state: profile.state,
        pincode: profile.pincode
      });

      const updated: EntrepreneurProfile = {
        ...profile,
        lat: geo.latitude,
        lng: geo.longitude,
        villageTown: profile.villageTown || geo.villageTown,
        district: profile.district || geo.district,
        state: profile.state || geo.state,
        pincode: profile.pincode || geo.pincode,
        radiusKm: profile.radiusKm || 3.0
      };

      onSaveProfile(updated);
      onClose();
    } catch (err) {
      console.error('Error saving profile:', err);
      onSaveProfile(profile);
      onClose();
    } finally {
      setIsGeocoding(false);
    }
  };

  const budgetChips = [10000, 14000, 20000, 100000, 500000];
  const livePreview = evaluateSIHScheme(profile.availableCapital);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-sbi-border w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-sbi-indigo text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-sbi-yellow" />
            <div>
              <h2 className="text-base font-bold">Configure Business &amp; Location Profile</h2>
              <p className="text-xs text-slate-300">Hyper-local spatial geocoding &amp; SIH26091 financial parameters</p>
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
          {/* 1. Geographic Location Section */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sbi-navy flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-sbi-blue" />
                <span>1. Geographic Location (State, District, Mandal, Village)</span>
              </h3>
              <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-bold border border-blue-200">
                Google Maps Geocoded
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">State *</label>
                <input
                  type="text"
                  value={profile.state || 'Andhra Pradesh'}
                  onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                  placeholder="e.g. Andhra Pradesh"
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-sm focus:border-sbi-blue focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">District *</label>
                <input
                  type="text"
                  value={profile.district}
                  onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                  placeholder="e.g. Guntur"
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-sm focus:border-sbi-blue focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Block / Mandal</label>
                <input
                  type="text"
                  value={profile.block || ''}
                  onChange={(e) => setProfile({ ...profile, block: e.target.value })}
                  placeholder="e.g. Tenali Mandal"
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-sm focus:border-sbi-blue focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Village / Town Name *</label>
                <input
                  type="text"
                  value={profile.villageTown}
                  onChange={(e) => setProfile({ ...profile, villageTown: e.target.value })}
                  placeholder="e.g. Tenali Town / Angalakuduru"
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-sm focus:border-sbi-blue focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Postal PIN Code (Optional)</label>
                <input
                  type="text"
                  value={profile.pincode}
                  onChange={(e) => setProfile({ ...profile, pincode: e.target.value })}
                  placeholder="e.g. 522201"
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-sm focus:border-sbi-blue focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Spatial Search Radius</label>
                <div className="flex items-center space-x-1.5">
                  {[1, 2, 3, 5, 10].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setProfile({ ...profile, radiusKm: r })}
                      className={`px-2.5 py-1.5 rounded text-xs font-bold border transition ${
                        (profile.radiusKm || 3) === r
                          ? 'bg-sbi-blue text-white border-sbi-blue shadow-xs'
                          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {r} km
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Geocoding Verification Action & Status */}
            <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleResolveCoordinates}
                disabled={isGeocoding || (!profile.villageTown && !profile.pincode)}
                className="bg-white hover:bg-slate-100 text-blue-700 border border-blue-300 px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
              >
                {isGeocoding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Compass className="w-3.5 h-3.5" />}
                <span>{isGeocoding ? 'Resolving Google Maps...' : 'Verify on Google Maps'}</span>
              </button>

              {resolvedAddress ? (
                <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                  ✓ {resolvedAddress}
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">
                  Click to test Google Maps geocoding resolution
                </span>
              )}
            </div>
          </div>

          {/* 2. Proposed Business */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
            <h3 className="font-bold text-sbi-navy flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-sbi-blue" />
              <span>2. Proposed Business &amp; Sector</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Business Category *</label>
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
          </div>

          {/* 3. Available Margin Capital */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sbi-navy flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <IndianRupee className="w-4 h-4 text-emerald-600" />
                <span>3. Available Margin Capital</span>
              </h3>
              <span className="text-[10px] text-sbi-blue font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                10% Beneficiary Contribution
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-white p-2.5 rounded border border-slate-200">
              Your available margin capital represents the beneficiary contribution used to estimate the feasible project cost.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Margin Capital Amount (₹ INR) *
              </label>
              <input
                type="number"
                value={profile.availableCapital > 0 ? profile.availableCapital : ''}
                onChange={(e) => setProfile({ ...profile, availableCapital: Math.max(0, Number(e.target.value)) })}
                step="1000"
                placeholder="e.g. 100000"
                className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm focus:border-sbi-blue focus:outline-none font-bold text-sbi-navy"
                required
              />
            </div>

            {/* Quick Capital Selection Chips */}
            <div>
              <span className="text-[11px] text-slate-500 font-semibold block mb-1.5">
                Quick Select Benchmark Margins:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {budgetChips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setProfile({ ...profile, availableCapital: chip })}
                    className={`px-3 py-1 rounded text-xs font-medium border transition ${
                      profile.availableCapital === chip
                        ? 'bg-sbi-blue text-white border-sbi-blue font-bold shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    ₹{chip.toLocaleString('en-IN')}
                    {chip === 10000 && ' (Micro)'}
                    {chip === 14000 && ' (Cap: 1.25L)'}
                    {chip === 100000 && ' (Term)'}
                    {chip === 500000 && ' (Cap: 45L)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Scheme Auto-Selection Preview */}
            {profile.availableCapital > 0 && (
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[10px] font-bold text-sbi-blue uppercase tracking-wider block mb-2">
                  Scheme Auto-Selection Preview (SIH26091 Rule Engine)
                </span>

                {livePreview.isOutsideRange ? (
                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-xs space-y-1">
                    <span className="font-bold text-amber-900 flex items-center gap-1">
                      <span>⚠️</span>
                      <span>Outside SIH26091 Scheme Range</span>
                    </span>
                    <p className="text-amber-800">
                      Your calculated project cost (₹{livePreview.projectCost.toLocaleString('en-IN')}) exceeds the ₹50 lakh maximum specified for the Term Loan Scheme.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-2 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-slate-500 font-semibold uppercase block">Available Margin</span>
                        <span className="font-extrabold text-slate-900">₹{livePreview.availableMargin.toLocaleString('en-IN')}</span>
                      </div>
                      <span className="text-slate-400 font-bold">→</span>
                      <div>
                        <span className="text-[10px] text-slate-500 font-semibold uppercase block">Project Cost (10x)</span>
                        <span className="font-extrabold text-sbi-indigo">₹{livePreview.projectCost.toLocaleString('en-IN')}</span>
                      </div>
                      <span className="text-slate-400 font-bold">→</span>
                      <div>
                        <span className="text-[10px] text-slate-500 font-semibold uppercase block">Maximum Loan (90%)</span>
                        <span className="font-extrabold text-emerald-700">₹{livePreview.eligibleLoan.toLocaleString('en-IN')}</span>
                        {livePreview.rawLoan > livePreview.schemeCap && (
                          <span className="text-[9px] text-amber-700 block font-normal">(Capped at ₹{(livePreview.schemeCap / 100000).toFixed(2)}L)</span>
                        )}
                      </div>
                      <span className="text-slate-400 font-bold">→</span>
                      <div>
                        <span className="text-[10px] text-slate-500 font-semibold uppercase block">Selected Scheme</span>
                        <span className="font-black text-sbi-navy bg-white px-2 py-0.5 rounded border border-emerald-300">
                          {livePreview.schemeName}
                        </span>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-600 pt-1 border-t border-emerald-200/60 flex items-center justify-between">
                      <span>Terms: <strong>{livePreview.interestRate}% p.a.</strong> | <strong>{livePreview.tenureYears} Years</strong> | <strong>{livePreview.moratoriumMonths}-Month Moratorium</strong></span>
                      <span className="text-[10px] text-slate-400">Quarterly Repayment</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGeocoding}
              className="bg-sbi-indigo hover:bg-purple-950 text-white font-bold text-xs px-6 py-2 rounded-lg flex items-center space-x-1.5 shadow-md transition active:scale-95 disabled:opacity-75"
            >
              {isGeocoding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-sbi-yellow" />
                  <span>Geocoding Location...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-sbi-yellow" />
                  <span>Save &amp; Analyze Market</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
