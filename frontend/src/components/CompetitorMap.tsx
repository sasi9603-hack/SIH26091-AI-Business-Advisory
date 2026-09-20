import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { CompetitorBusiness } from '../types';
import { MapPin, ShieldCheck, Info, Layers, Compass, PlusCircle, Loader2 } from 'lucide-react';

interface CompetitorMapProps {
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  competitors: CompetitorBusiness[];
  locationLabel: string;
  categoryLabel: string;
  disclaimer?: string;
  isLoading?: boolean;
  onRadiusChange?: (newRadius: number) => void;
  onOpenReportModal?: () => void;
}

export const CompetitorMap: React.FC<CompetitorMapProps> = ({
  centerLat,
  centerLng,
  radiusKm,
  competitors,
  locationLabel,
  categoryLabel,
  disclaimer,
  isLoading,
  onRadiusChange,
  onOpenReportModal
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Map if not already created
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: radiusKm <= 2 ? 14 : radiusKm <= 5 ? 13 : 12,
        scrollWheelZoom: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([centerLat, centerLng], radiusKm <= 2 ? 14 : radiusKm <= 5 ? 13 : 12);
    }

    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    // Clear previous markers
    layerGroup.clearLayers();

    // 1. Add Proposed Location Marker (Indigo/Cyan Target)
    const centerIcon = L.divIcon({
      className: 'custom-pin-center',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <span style="position: absolute; width: 32px; height: 32px; background: rgba(0, 153, 219, 0.35); border-radius: 9999px; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
          <div style="width: 28px; height: 28px; background: #23005A; border: 3px solid #0099DB; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
            <div style="width: 8px; height: 8px; background: #FFD200; border-radius: 9999px;"></div>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const centerMarker = L.marker([centerLat, centerLng], { icon: centerIcon })
      .bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; min-width: 170px; line-height: 1.4;">
          <div style="background: #23005A; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; margin-bottom: 6px;">
            Target Proposed Location
          </div>
          <div><strong>Location:</strong> ${locationLabel}</div>
          <div><strong>Sector:</strong> ${categoryLabel}</div>
          <div style="color: #0099DB; font-weight: 600; margin-top: 4px;">Proposed Enterprise Center</div>
        </div>
      `);
    layerGroup.addLayer(centerMarker);

    // 2. Add Search Radius Circle
    const radiusCircle = L.circle([centerLat, centerLng], {
      radius: radiusKm * 1000,
      color: '#0099DB',
      fillColor: '#38B6FF',
      fillOpacity: 0.08,
      weight: 1.5,
      dashArray: '4, 6'
    });
    layerGroup.addLayer(radiusCircle);

    // 3. Add Competitor Markers
    competitors.forEach((c) => {
      let pinColor = '#10B981'; // OpenStreetMap = Emerald Green
      let badgeLabel = 'OSM Mapped';
      let badgeBg = '#ECFDF5';
      let badgeText = '#065F46';

      if (c.source === 'UDYAM') {
        pinColor = '#2563EB'; // UDYAM = Blue
        badgeLabel = 'UDYAM Govt Registered';
        badgeBg = '#EFF6FF';
        badgeText = '#1E40AF';
      } else if (c.source === 'COMMUNITY') {
        pinColor = '#F59E0B'; // Community = Amber
        badgeLabel = 'Community Reported';
        badgeBg = '#FFFBEB';
        badgeText = '#92400E';
      }

      const compIcon = L.divIcon({
        className: 'custom-pin-comp',
        html: `
          <div style="width: 24px; height: 24px; background: ${pinColor}; border: 2px solid #FFFFFF; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.25);">
            <div style="width: 6px; height: 6px; background: white; border-radius: 9999px;"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([c.lat, c.lng], { icon: compIcon })
        .bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; min-width: 200px; line-height: 1.4;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-weight: bold; color: #0C2340; font-size: 13px;">${c.name}</span>
            </div>
            <div style="margin-bottom: 4px;">
              <span style="background: ${badgeBg}; color: ${badgeText}; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">
                ${badgeLabel}
              </span>
            </div>
            <div style="color: #475569; margin-top: 4px;"><strong>Distance:</strong> ${c.distanceKm} km from target</div>
            <div style="color: #475569;"><strong>Confidence:</strong> ${(c.confidenceScore * 100).toFixed(0)}%</div>
            <div style="color: #64748B; font-size: 11px; margin-top: 4px; border-top: 1px solid #E2E8F0; padding-top: 4px;">${c.address}</div>
          </div>
        `);
      layerGroup.addLayer(marker);
    });

    // Cleanup when component unmounts
    return () => {
      // Don't fully remove on every prop change to avoid re-initializing tiles
    };
  }, [centerLat, centerLng, radiusKm, competitors, locationLabel, categoryLabel]);

  return (
    <div className="bg-white rounded-xl shadow-sbi border border-sbi-border overflow-hidden">
      {/* Map Control Toolbar */}
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-sbi-blue" />
          <h3 className="font-bold text-sm text-sbi-navy">
            Hyper-Local Competitor &amp; Spatial Density Map
          </h3>
          <span className="text-[10px] bg-sky-100 text-sbi-blue font-bold px-2 py-0.5 rounded border border-sky-200">
            OpenStreetMap POIs &bull; Radius {radiusKm} km
          </span>
        </div>

        {/* Radius Filter Buttons */}
        <div className="flex items-center space-x-1.5 text-xs font-semibold">
          <span className="text-slate-400 text-[11px] mr-1">Radius:</span>
          {[1, 2, 3, 5, 10].map((r) => (
            <button
              key={r}
              onClick={() => onRadiusChange && onRadiusChange(r)}
              className={`px-2.5 py-1 rounded text-xs transition ${
                radiusKm === r
                  ? 'bg-sbi-blue text-white font-bold shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {r} km
            </button>
          ))}

          {onOpenReportModal && (
            <button
              onClick={onOpenReportModal}
              className="ml-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs px-2.5 py-1 rounded flex items-center gap-1 font-semibold transition"
              title="Report an unmapped local informal shop"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-700" />
              <span>Report Local Shop</span>
            </button>
          )}
        </div>
      </div>

      {/* Leaflet Map Div */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 z-30 bg-white/70 backdrop-blur-xs flex items-center justify-center">
            <div className="bg-white px-4 py-2.5 rounded-lg shadow-lg border border-slate-200 flex items-center gap-2 text-xs font-bold text-sbi-navy">
              <Loader2 className="w-4 h-4 animate-spin text-sbi-blue" />
              <span>Querying OpenStreetMap POIs...</span>
            </div>
          </div>
        )}
        <div ref={mapContainerRef} className="w-full h-80 z-10" />

        {/* Floating Legend */}
        <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-xs p-2.5 rounded-lg shadow-md border border-slate-200 text-[11px] space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-sbi-indigo border border-sbi-blue inline-block"></span>
            <span className="text-slate-700 font-medium">Proposed Center</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white inline-block"></span>
            <span className="text-slate-700 font-medium">OpenStreetMap Shop</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-600 border border-white inline-block"></span>
            <span className="text-slate-700 font-medium">UDYAM Registered</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 border border-white inline-block"></span>
            <span className="text-slate-700 font-medium">Community Ground-Truth</span>
          </div>
        </div>
      </div>

      {/* Disclaimer Banner adhering strictly to instructions */}
      <div className="bg-sky-50/70 border-t border-sky-200 px-4 py-2.5 text-xs text-slate-600 flex items-start gap-2">
        <Info className="w-4 h-4 text-sbi-blue shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {disclaimer || `${competitors.length} businesses found in available map data. Note: OpenStreetMap represents crowdsourced geographic POIs; informal street vendors or recently opened local shops may not be fully mapped.`}
        </p>
      </div>
    </div>
  );
};
