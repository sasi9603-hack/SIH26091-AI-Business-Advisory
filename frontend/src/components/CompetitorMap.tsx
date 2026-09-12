import React, { useEffect, useRef, useState } from 'react';
import { CompetitorBusiness } from '../types';
import L from 'leaflet';
import { MapPin, ShieldCheck, HelpCircle, PlusCircle, Filter } from 'lucide-react';

interface CompetitorMapProps {
  competitors: CompetitorBusiness[];
  centerLat: number;
  centerLng: number;
  locationName: string;
  onOpenAddModal: () => void;
}

export const CompetitorMap: React.FC<CompetitorMapProps> = ({
  competitors,
  centerLat,
  centerLng,
  locationName,
  onOpenAddModal
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [selectedRadius, setSelectedRadius] = useState<number>(3.0);
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy existing map instance if already initialized
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize Leaflet Map
    const map = L.map(mapContainerRef.current).setView([centerLat, centerLng], 14);
    mapInstanceRef.current = map;

    // Add OpenStreetMap standard tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Center marker (Proposed Entrepreneur Location)
    const centerIcon = L.divIcon({
      className: 'custom-pin-center',
      html: `<div style="background-color: #23005A; color: #FFD200; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 3px solid #FFFFFF; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">📍</div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    L.marker([centerLat, centerLng], { icon: centerIcon })
      .addTo(map)
      .bindPopup(`<strong>Proposed Location</strong><br/>${locationName}<br/><em>Target Advisory Center</em>`);

    // Radius circle buffer
    L.circle([centerLat, centerLng], {
      radius: selectedRadius * 1000,
      color: '#0099DB',
      fillColor: '#0099DB',
      fillOpacity: 0.08,
      weight: 1.5,
      dashArray: '4, 4'
    }).addTo(map);

    // Plot Competitors
    competitors.forEach((c) => {
      let pinColor = '#0099DB'; // UDYAM (Blue)
      let label = 'U';
      if (c.source === 'OPENSTREETMAP') {
        pinColor = '#10B981'; // OSM (Green)
        label = 'M';
      } else if (c.source === 'COMMUNITY') {
        pinColor = '#F59E0B'; // Community (Amber)
        label = 'C';
      }

      const compIcon = L.divIcon({
        className: 'custom-pin-comp',
        html: `<div style="background-color: ${pinColor}; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.25);">${label}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      L.marker([c.lat, c.lng], { icon: compIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
            <strong style="color: #0C2340; font-size: 13px;">${c.name}</strong><br/>
            <span>Source: <strong>${c.source}</strong></span><br/>
            <span>Confidence: <strong>${(c.confidenceScore * 100).toFixed(0)}%</strong></span><br/>
            <span>Distance: <strong>${c.distanceKm} km</strong></span><br/>
            <span style="color: #64748B;">${c.address}</span>
          </div>
        `);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [centerLat, centerLng, locationName, competitors, selectedRadius]);

  const filteredCompetitors = competitors.filter(c => {
    if (sourceFilter === 'ALL') return true;
    return c.source === sourceFilter;
  });

  return (
    <div className="bg-white rounded-xl shadow-sbi border border-sbi-border p-6 space-y-6">
      {/* Header & Radius Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-sbi-navy flex items-center gap-2">
            <MapPin className="w-5 h-5 text-sbi-blue" />
            <span>Hyper-Local Competitor Map &amp; Spatial Density</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Geospatial intelligence combining UDYAM official registry, OpenStreetMap, and ground-truth community reports
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Radius Selector */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <span className="text-slate-500 font-semibold px-2">Radius:</span>
            {[1.0, 3.0, 5.0].map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRadius(r)}
                className={`px-2.5 py-1 rounded font-bold transition ${
                  selectedRadius === r
                    ? 'bg-sbi-blue text-white shadow-sm'
                    : 'text-slate-700 hover:bg-white'
                }`}
              >
                {r} km
              </button>
            ))}
          </div>

          {/* Add Community Business Button */}
          <button
            onClick={onOpenAddModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Local Vendor</span>
          </button>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-inner">
        <div ref={mapContainerRef} className="h-96 w-full z-0" />

        {/* Map Legend Overlay */}
        <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-xs p-3 rounded-lg shadow-md border border-slate-200 text-xs space-y-1.5">
          <span className="font-bold text-slate-700 block text-[11px]">Map Legend &amp; Provenance:</span>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-sbi-indigo border border-white inline-block"></span>
            <span className="text-slate-600">📍 Target Proposed Shop</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#0099DB] border border-white inline-block"></span>
            <span className="text-slate-600">U : UDYAM Registered (0.95 Cb)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#10B981] border border-white inline-block"></span>
            <span className="text-slate-600">M : OpenStreetMap Mapped (0.85 Cb)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#F59E0B] border border-white inline-block"></span>
            <span className="text-slate-600">C : Community Reported (0.65 Cb)</span>
          </div>
        </div>
      </div>

      {/* Discovered Competitors Table */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sbi-navy text-sm">
            Discovered Local Competitors ({filteredCompetitors.length})
          </h3>

          {/* Source Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Source:</span>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-slate-100 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none"
            >
              <option value="ALL">All Sources</option>
              <option value="UDYAM">UDYAM Registered</option>
              <option value="OPENSTREETMAP">OpenStreetMap</option>
              <option value="COMMUNITY">Community Reported</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-2.5">Business Name</th>
                <th className="px-4 py-2.5">Data Source</th>
                <th className="px-4 py-2.5">Verification</th>
                <th className="px-4 py-2.5">Distance</th>
                <th className="px-4 py-2.5">Confidence Score</th>
                <th className="px-4 py-2.5">Approximate Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {filteredCompetitors.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-semibold text-sbi-navy">{c.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.source === 'UDYAM'
                        ? 'bg-blue-100 text-blue-800'
                        : c.source === 'OPENSTREETMAP'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {c.source}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1 font-semibold ${
                      c.verificationStatus === 'VERIFIED' ? 'text-emerald-700' : 'text-amber-700'
                    }`}>
                      {c.verificationStatus === 'VERIFIED' ? <ShieldCheck className="w-3.5 h-3.5" /> : <HelpCircle className="w-3.5 h-3.5" />}
                      <span>{c.verificationStatus}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{c.distanceKm} km</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{c.confidenceScore.toFixed(2)}</span>
                      <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-sbi-blue h-full"
                          style={{ width: `${c.confidenceScore * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 truncate max-w-xs">{c.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
