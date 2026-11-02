import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';

export default function MapView() {
  const el = useRef<HTMLDivElement>(null);
  const [n, setN] = useState<number | null>(null);

  useEffect(() => {
    const map = new maplibregl.Map({
      container: el.current!, center: [72.9, 31.2], zoom: 6,
      style: { version: 8, sources: { osm: { type: 'raster', tileSize: 256, attribution: '© OpenStreetMap contributors', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'] } }, layers: [{ id: 'osm', type: 'raster', source: 'osm' }] },
    });
    map.addControl(new maplibregl.NavigationControl());
    map.on('load', async () => {
      const geo = await api('/gis/locations');
      setN(geo.features.length);
      map.addSource('qic', { type: 'geojson', data: geo });
      map.addLayer({ id: 'qic', type: 'circle', source: 'qic', paint: {
        'circle-radius': 8, 'circle-stroke-width': 2, 'circle-stroke-color': '#fff',
        'circle-color': ['case', ['==', ['get', 'insideDistrict'], false], '#b91c1c', ['==', ['get', 'decision'], 'defer'], '#d97706', '#1f4d3a'] } });
      map.on('click', 'qic', (e) => {
        const p = e.features![0].properties as any;
        new maplibregl.Popup().setLngLat((e.features![0].geometry as any).coordinates)
          .setHTML(`<b>${p.manufacturer}</b><br/>${p.district} · lot ${p.lotSize ?? '—'}<br/>${p.engineer}<br/><a href="/records/${p.id}">Open record</a>`).addTo(map);
      });
      map.on('mouseenter', 'qic', () => (map.getCanvas().style.cursor = 'pointer'));
      map.on('mouseleave', 'qic', () => (map.getCanvas().style.cursor = ''));
      if (geo.features.length) {
        const b = new maplibregl.LngLatBounds();
        geo.features.forEach((f: any) => b.extend(f.geometry.coordinates));
        map.fitBounds(b, { padding: 60, maxZoom: 12 });
      }
    });
    return () => map.remove();
  }, []);

  return (
    <div>
      <p className="mb-2 text-sm text-slate-600">QIC inspection locations at manufacturers{n != null && ` (${n})`}. <span className="text-brand">● passed</span> · <span className="text-amber-600">● deferred</span> · <span className="text-red-700">● outside district boundary</span></p>
      <div ref={el} className="h-[70vh] rounded-lg shadow-sm" />
    </div>
  );
}
