import React, { useState } from 'react';
import { X, Check, MapPin, Store } from 'lucide-react';
import { BusinessCategory } from '../types';
import { CATEGORY_LABELS } from '../services/mockData';
import { submitCommunityReport } from '../services/api';

interface CommunityReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLat: number;
  defaultLng: number;
  defaultCategory: BusinessCategory;
  onSuccess: () => void;
}

export const CommunityReportModal: React.FC<CommunityReportModalProps> = ({
  isOpen,
  onClose,
  defaultLat,
  defaultLng,
  defaultCategory,
  onSuccess
}) => {
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState<BusinessCategory>(defaultCategory);
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !address.trim()) return;

    setSubmitting(true);
    const ok = await submitCommunityReport({
      businessName,
      category,
      latitude: defaultLat,
      longitude: defaultLng,
      address
    });
    setSubmitting(false);

    if (ok) {
      setSuccessMsg('Thank you! Business added to community ground-truth database.');
      setTimeout(() => {
        setSuccessMsg('');
        onSuccess();
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-sbi-border w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-sbi-indigo text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Store className="w-5 h-5 text-sbi-yellow" />
            <h3 className="font-bold text-sm">Report Unmapped Local Business</h3>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <p className="text-slate-500 leading-relaxed">
            OpenStreetMap may not list every informal vendor or village shop. Help improve local market transparency by reporting active businesses.
          </p>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Business / Shop Name *</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Ramesh Agro Repairs"
              className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 focus:border-sbi-blue focus:bg-white focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Business Trade / Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as BusinessCategory)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 focus:border-sbi-blue focus:bg-white focus:outline-none"
            >
              {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                <option key={k} value={k}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Local Address or Landmark *</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Main Bazaar Road, near Bus Stand"
              className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 focus:border-sbi-blue focus:bg-white focus:outline-none"
              required
            />
          </div>

          <div className="bg-sky-50 border border-sky-200 p-2.5 rounded text-[11px] text-slate-600 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-sbi-blue shrink-0" />
            <span>Tagging at coordinates: <strong>{defaultLat.toFixed(4)}, {defaultLng.toFixed(4)}</strong></span>
          </div>

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-2 rounded text-center font-semibold">
              {successMsg}
            </div>
          )}

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-slate-600 hover:text-slate-800 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-sbi-blue hover:bg-sky-600 text-white font-bold px-4 py-1.5 rounded shadow-xs transition"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
