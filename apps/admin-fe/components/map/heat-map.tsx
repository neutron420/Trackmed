"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export interface HeatPoint {
  id: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  orders: number;
  size?: number;
}

interface HeatMapProps {
  points: HeatPoint[];
  height?: number | string;
}

export function HeatMap({ points, height = 420 }: HeatMapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const maxOrders = Math.max(...points.map((p) => p.orders), 1);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current || !mapboxgl.accessToken) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [78.9629, 20.5937], // India center
      zoom: 4,
      pitch: 10,
      antialias: true,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");

    map.on("load", () => {
      const features = points.map((p) => ({
        type: "Feature" as const,
        properties: {
          id: p.id,
          name: p.name,
          city: p.city,
          state: p.state,
          orders: p.orders,
          size: p.size ?? Math.max(8, Math.min(32, p.orders * 0.2)),
        },
        geometry: {
          type: "Point" as const,
          coordinates: [p.lng, p.lat],
        },
      }));

      const sourceId = "heat-points";
      map.addSource(sourceId, {
        type: "geojson",
        data: { type: "FeatureCollection", features },
      });

      // Heatmap layer
      map.addLayer({
        id: "heat-layer",
        type: "heatmap",
        source: sourceId,
        maxzoom: 9,
        paint: {
          "heatmap-weight": ["interpolate", ["linear"], ["get", "orders"], 0, 0, maxOrders, 1],
          "heatmap-intensity": 1.2,
          "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 4, 18, 9, 40],
          "heatmap-opacity": 0.6,
          "heatmap-color": [
            "interpolate", ["linear"], ["heatmap-density"],
            0, "rgba(16,185,129,0)",
            0.3, "rgba(16,185,129,0.55)",
            0.5, "rgba(250,204,21,0.65)",
            0.7, "rgba(249,115,22,0.8)",
            1, "rgba(239,68,68,0.95)",
          ],
        },
      });

      // Circle bubbles
      map.addLayer({
        id: "bubbles",
        type: "circle",
        source: sourceId,
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["get", "size"], 0, 6, 40, 28],
          "circle-color": [
            "interpolate", ["linear"], ["get", "orders"],
            0, "#10b981",
            maxOrders * 0.4, "#facc15",
            maxOrders * 0.7, "#f97316",
            maxOrders, "#ef4444",
          ],
          "circle-opacity": 0.55,
          "circle-stroke-width": 1.2,
          "circle-stroke-color": [
            "interpolate", ["linear"], ["get", "orders"],
            0, "#059669",
            maxOrders, "#b91c1c",
          ],
        },
      });

      // Order count labels
      map.addLayer({
        id: "bubble-count",
        type: "symbol",
        source: sourceId,
        layout: {
          "text-field": ["to-string", ["get", "orders"]],
          "text-size": 11,
          "text-offset": [0, 0.2],
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
        },
        paint: {
          "text-color": "#0f172a",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1.2,
        },
      });

      // Name labels
      map.addLayer({
        id: "labels",
        type: "symbol",
        source: sourceId,
        layout: {
          "text-field": ["concat", ["get", "name"], "\n", ["get", "city"]],
          "text-size": 11,
          "text-offset": [0, 0.8],
          "text-variable-anchor": ["top", "bottom", "left", "right"],
          "text-justify": "auto",
        },
        paint: {
          "text-color": "#0f172a",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1.2,
        },
      });

      // Popup on click
      map.on("click", "bubbles", (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const { name, city, state, orders } = feature.properties as any;
        new mapboxgl.Popup({ closeButton: true })
          .setLngLat((feature.geometry as any).coordinates)
          .setHTML(
            `<div style="font-weight:600;font-size:14px;color:#0f172a;">${name}</div>
             <div style="font-size:12px;color:#475569;margin-top:2px;">Capital: ${city}</div>
             <div style="font-size:12px;color:#0ea5e9;margin-top:4px;font-weight:500;">Activity: ${orders} entities</div>`
          )
          .addTo(map);
      });

      // Change cursor on hover
      map.on("mouseenter", "bubbles", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "bubbles", () => {
        map.getCanvas().style.cursor = "";
      });

      // Fit bounds to points
      if (features.length > 0) {
        const bounds = features.reduce(
          (b, f) => b.extend(f.geometry.coordinates as [number, number]),
          new mapboxgl.LngLatBounds()
        );
        map.fitBounds(bounds, { padding: 60, maxZoom: 6 });
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [points, maxOrders]);

  // Update data when points change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const source = map.getSource("heat-points") as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData({
        type: "FeatureCollection",
        features: points.map((p) => ({
          type: "Feature" as const,
          properties: {
            id: p.id,
            name: p.name,
            city: p.city,
            state: p.state,
            orders: p.orders,
            size: p.size ?? Math.max(8, Math.min(32, p.orders * 0.2)),
          },
          geometry: { type: "Point" as const, coordinates: [p.lng, p.lat] },
        })),
      });
    }
  }, [points]);

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50 shadow-sm">
      <div ref={mapContainer} style={{ width: "100%", height }} />
      <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-white/90 px-3 py-2 text-[11px] text-slate-700 shadow">
        <div className="font-semibold text-slate-800">Heatmap Legend</div>
        <div className="mt-1 flex items-center gap-2">
          <span className="h-2 w-10 rounded-full bg-gradient-to-r from-emerald-400 via-amber-300 via-orange-400 to-red-500" />
          <span className="text-[10px] text-slate-500">Low → High intensity</span>
        </div>
      </div>
    </div>
  );
}
