import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { CompetitorBusiness } from '../types';
import { ShieldCheck, Info, Layers, Compass, PlusCircle, Loader2, ExternalLink, Navigation } from 'lucide-react';

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
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');

  // Google Maps tile URLs
  // lyrs=m : Standard Google Roadmap
  // lyrs=y : Google Hybrid (Satellite + Roads/Labels)
  const googleRoadmapUrl = 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
  const googleSatelliteUrl = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';

  const googleMapsAreaUrl = `https://www.google.com/maps/@${centerLat},${centerLng},14z`;

  // Toggle between Google Roadmap and Google Satellite
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const url = mapType === 'satellite' ? googleSatelliteUrl : googleRoadmapUrl;
    tileLayerRef.current.setUrl(url);
  }, [mapType]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const zoom = radiusKm <= 2 ? 14 : radiusKm <= 5 ? 13 : 12;

    // Initialize Map with Google Maps Tiles if not already created
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: zoom,
        scrollWheelZoom: false
      });

      const tileLayer = L.tileLayer(mapType === 'satellite' ? googleSatelliteUrl : googleRoadmapUrl, {
        attribution: '&copy; <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer">Google Maps</a> &bull; Map Data &copy; Google',
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([centerLat, centerLng], zoom);
    }

    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    // Clear previous markers
    layerGroup.clearLayers();

    // 1. Add Proposed Location Marker (Indigo/Cyan Target with pulsating ring)
    const centerIcon = L.divIcon({
      className: 'custom-pin-center',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <span style="position: absolute; width: 34px; height: 34px; background: rgba(66, 133, 244, 0.4); border-radius: 9999px; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
          <div style="width: 30px; height: 30px; background: #1A73E8; border: 3px solid #FFFFFF; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.35);">
            <div style="width: 10px; height: 10px; background: #FBBC04; border-radius: 9999px;"></div>
          </div>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    const centerGmapsUrl = `https://www.google.com/maps/search/?api=1&query=${centerLat},${centerLng}`;

    const centerMarker = L.marker([centerLat, centerLng], { icon: centerIcon })
      .bindPopup(`
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; min-width: 210px; line-height: 1.45; padding: 2px;">
          <div style="background: #1A73E8; color: white; padding: 6px 10px; border-radius: 6px; font-weight: bold; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
            <span>Target Proposed Location</span>
            <span style="font-size: 10px; background: rgba(255,255,255,0.25); padding: 1px 5px; border-radius: 4px;">CENTER</span>
          </div>
          <div style="margin-bottom: 3px;"><strong>Location:</strong> ${locationLabel}</div>
          <div style="margin-bottom: 6px;"><strong>Proposed Sector:</strong> ${categoryLabel}</div>
          <div style="border-top: 1px solid #E2E8F0; padding-top: 6px; margin-top: 6px;">
            <a href="${centerGmapsUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 4px; color: #1A73E8; font-weight: 600; text-decoration: none; font-size: 11px; background: #E8F0FE; padding: 4px 8px; border-radius: 4px; border: 1px solid #D2E3FC;">
              📍 Open Location in Google Maps &rarr;
            </a>
          </div>
        </div>
      `);
    layerGroup.addLayer(centerMarker);

    // 2. Add Search Radius Circle (Google Blue tint)
    const radiusCircle = L.circle([centerLat, centerLng], {
      radius: radiusKm * 1000,
      color: '#1A73E8',
      fillColor: '#4285F4',
      fillOpacity: 0.08,
      weight: 1.8,
      dashArray: '5, 6'
    });
    layerGroup.addLayer(radiusCircle);

    // 3. Add Competitor Markers with Google Maps Deep-Linking
    competitors.forEach((c) => {
      let pinColor = '#34A853'; // Google Green = Verified Commercial / Google Maps
      let badgeLabel = 'Google Maps Verified';
      let badgeBg = '#E6F4EA';
      let badgeText = '#137333';

      if (c.source === 'UDYAM') {
        pinColor = '#1A73E8'; // Google Blue = UDYAM Govt Registered
        badgeLabel = 'UDYAM Govt Registered';
        badgeBg = '#E8F0FE';
        badgeText = '#1A73E8';
      } else if (c.source === 'COMMUNITY') {
        pinColor = '#FBBC04'; // Google Yellow = Community Ground-Truth
        badgeLabel = 'Community Reported';
        badgeBg = '#FEF7E0';
        badgeText = '#B06000';
      }

      const compIcon = L.divIcon({
        className: 'custom-pin-comp',
        html: `
          <div style="width: 26px; height: 26px; background: ${pinColor}; border: 2px solid #FFFFFF; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.35);">
            <div style="width: 7px; height: 7px; background: white; border-radius: 9999px;"></div>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      const gmapsLink = c.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lng}`;
      const directionsLink = `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`;

      const marker = L.marker([c.lat, c.lng], { icon: compIcon })
        .bindPopup(`
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; min-width: 230px; line-height: 1.45; padding: 2px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-weight: bold; color: #202124; font-size: 13px;">${c.name}</span>
            </div>
            <div style="margin-bottom: 6px;">
              <span style="background: ${badgeBg}; color: ${badgeText}; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; display: inline-block;">
                ${badgeLabel}
              </span>
            </div>
            <div style="color: #3C4043; margin-top: 4px;"><strong>Distance:</strong> ${c.distanceKm} km from target</div>
            <div style="color: #5F6368; font-size: 11px; margin-top: 4px; border-top: 1px solid #E8EAED; padding-top: 4px;">${c.address}</div>
            <div style="display: flex; gap: 6px; margin-top: 8px; border-top: 1px solid #E8EAED; padding-top: 8px;">
              <a href="${gmapsLink}" target="_blank" rel="noopener noreferrer" style="flex: 1; text-align: center; background: #1A73E8; color: white; padding: 5px 8px; border-radius: 5px; font-weight: 600; text-decoration: none; font-size: 11px; display: inline-flex; align-items: center; justify-content: center; gap: 4px;">
                📍 View in Google Maps
              </a>
              <a href="${directionsLink}" target="_blank" rel="noopener noreferrer" style="text-align: center; background: #F1F3F4; color: #3C4043; padding: 5px 8px; border-radius: 5px; font-weight: 600; text-decoration: none; font-size: 11px; border: 1px solid #DADCE0;" title="Get Directions">
                🧭
              </a>
            </div>
          </div>
        `);
      layerGroup.addLayer(marker);
    });

    return () => {
      // Keep instance intact across state toggles
    };
  }, [centerLat, centerLng, radiusKm, competitors, locationLabel, categoryLabel, mapType]);

  return (
    <div className="bg-white rounded-xl shadow-sbi border border-sbi-border overflow-hidden">
      {/* Map Control Toolbar */}
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <img 
            src="https://www.gstatic.com/images/branding/product/1x/maps_64dp.png" 
            alt="Google Maps" 
            className="w-4 h-4 object-contain"
            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
          />
          <Layers className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-sm text-sbi-navy">
            Google Maps &bull; Hyper-Local Competitor Density
          </h3>
          <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded border border-blue-200">
            Google Maps Verified &bull; Radius {radiusKm} km
          </span>
        </div>

        {/* Map View & Radius Controls */}
        <div className="flex items-center flex-wrap gap-2 text-xs font-semibold">
          {/* Map Layer Switcher: Roadmap vs Satellite */}
          <div className="bg-white border border-slate-200 rounded-lg p-0.5 flex items-center shadow-2xs">
            <button
              onClick={() => setMapType('roadmap')}
              className={`px-2 py-1 rounded text-xs font-semibold transition ${
                mapType === 'roadmap' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🗺️ Map
            </button>
            <button
              onClick={() => setMapType('satellite')}
              className={`px-2 py-1 rounded text-xs font-semibold transition ${
                mapType === 'satellite' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🛰️ Satellite
            </button>
          </div>

          <span className="text-slate-400 text-[11px] ml-1">Radius:</span>
          {[1, 2, 3, 5, 10].map((r) => (
            <button
              key={r}
              onClick={() => onRadiusChange && onRadiusChange(r)}
              className={`px-2.5 py-1 rounded text-xs transition ${
                radiusKm === r
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {r} km
            </button>
          ))}

          {/* External Google Maps Button */}
          <a
            href={googleMapsAreaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs px-2.5 py-1 rounded flex items-center gap-1 font-semibold transition"
            title="Open area directly on Google Maps"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open in Google Maps</span>
          </a>

          {onOpenReportModal && (
            <button
              onClick={onOpenReportModal}
              className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs px-2.5 py-1 rounded flex items-center gap-1 font-semibold transition"
              title="Report an unmapped local informal shop"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-700" />
              <span>Report Local Shop</span>
            </button>
          )}
        </div>
      </div>

      {/* Map Display Div */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 z-30 bg-white/70 backdrop-blur-xs flex items-center justify-center">
            <div className="bg-white px-4 py-2.5 rounded-lg shadow-lg border border-slate-200 flex items-center gap-2 text-xs font-bold text-sbi-navy">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>Querying Google Maps &amp; Places...</span>
            </div>
          </div>
        )}
        <div ref={mapContainerRef} className="w-full h-80 z-10" />

        {/* Floating Google Maps Style Legend */}
        <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-xs p-2.5 rounded-lg shadow-md border border-slate-200 text-[11px] space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-600 border border-white inline-block shadow-2xs"></span>
            <span className="text-slate-700 font-medium">Proposed Enterprise Center</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white inline-block shadow-2xs"></span>
            <span className="text-slate-700 font-medium">Google Maps Verified Business</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-600 border border-white inline-block shadow-2xs"></span>
            <span className="text-slate-700 font-medium">UDYAM Govt Registered MSME</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 border border-white inline-block shadow-2xs"></span>
            <span className="text-slate-700 font-medium">Community Ground-Truth</span>
          </div>
        </div>
      </div>

      {/* Disclaimer Banner */}
      <div className="bg-blue-50/70 border-t border-blue-200 px-4 py-2.5 text-xs text-slate-600 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {disclaimer || `${competitors.length} businesses verified via Google Maps & Places within ${radiusKm} km. Click any pin to open directly in Google Maps for live street view and driving directions.`}
          </p>
        </div>
        <a
          href={`https://www.google.com/maps/search/${encodeURIComponent(categoryLabel)}+near+${encodeURIComponent(locationLabel)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-blue-700 hover:text-blue-900 font-bold underline flex items-center gap-1 text-[11px]"
        >
          <span>Search {categoryLabel} on Google Maps</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
