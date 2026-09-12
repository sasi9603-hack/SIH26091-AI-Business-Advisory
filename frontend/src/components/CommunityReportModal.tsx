import React, { useState } from 'react';
import { CompetitorBusiness } from '../types';
import { X, Check, FileText } from 'lucide-react';

interface CommunityReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCompetitor: (competitor: CompetitorBusiness) => void;
  centerLat: number;
  centerLng: number;
}

export const CommunityReportModal: React.FC<CommunityReportModalProps> = ({
  isOpen,
  onClose,
  onAddCompetitor,
  centerLat,
  centerLng
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('agro-repair');
  const [address, setAddress] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Create a new community reported competitor
    const newComp: CompetitorBusiness = {
      id: `comm-${Date.now()}`,
      name: name.trim(),
      category: category,
      source: 'COMMUNITY',
      confidenceScore: 0.65,
      verificationStatus: 'UNVERIFIED',
      distanceKm: +(0.5 + Math.random() * 2.0).toFixed(1),
      lat: centerLat + (Math.random() - 0.5) * 0.01,
      lng: centerLng + (Math.random() - 0.5) * 0.01,
      address: address.trim() || 'Reported Village Commercial Area',
      reportedDate: new Date().toISOString().split('T')[0],
      upvotes: 1
    };

    onAddCompetitor(newComp);
    onClose();
    alert(`Thank you! "${name}" has been recorded as a Community-Reported local business.`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-sbi-border w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-sbi-indigo text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-sbi-yellow" />
            <div>
              <h2 className="text-base font-bold">Report / Add Local Business</h2>
              <p className="text-xs text-slate-300">Ground-truth community reporting for informal vendors</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white transition p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Local Shop / Vendor Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Venkat Motor Rewinding Works"
              className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm focus:border-sbi-blue focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Business Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm focus:border-sbi-blue focus:outline-none"
            >
              <option value="agro-repair">Agro-Machinery &amp; Pump Repair</option>
              <option value="grocery">Kirana &amp; Grocery Store</option>
              <option value="tailoring">Tailoring &amp; Garments</option>
              <option value="dairy">Dairy &amp; Milk Unit</option>
              <option value="food-processing">Food &amp; Spice Mill</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Landmark / Approximate Location</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Near Old Panchayat Office, Guntur Rural"
              className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm focus:border-sbi-blue focus:outline-none"
            />
          </div>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 leading-relaxed">
            <strong>Data Integrity Notice:</strong> Community-reported businesses will initially be flagged as <em>Unverified (0.65 Confidence Score)</em> until corroborated by secondary reports or field check.
          </div>

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
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded shadow flex items-center gap-1.5 transition active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Submit Ground-Truth Report</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
