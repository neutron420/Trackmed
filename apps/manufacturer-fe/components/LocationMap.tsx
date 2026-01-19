"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface LocationMapProps {
  address?: string;
  lat?: number;
  lng?: number;
  height?: number | string;
  pincode?: string;
}

export function LocationMap({ address, lat, lng, height = 300, pincode }: LocationMapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    // Don't initialize map if no token
    if (!mapboxgl.accessToken) {
      setMapError("Mapbox token not configured");
      return;
    }

    try {
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [78.9629, 20.5937], // Default: India center
        zoom: 4,
      });

      map.addControl(new mapboxgl.NavigationControl(), "top-right");

      mapRef.current = map;

      return () => {
        map.remove();
        mapRef.current = null;
      };
    } catch (error: any) {
      console.error("Map initialization error:", error);
      setMapError("Failed to load map");
    }
  }, []);

  // Update map when location changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    let cancelled = false;

    // If lat/lng provided, use them
    if (lat && lng) {
      map.flyTo({
        center: [lng, lat],
        zoom: 14,
      });

      // Remove existing marker
      if (markerRef.current) {
        markerRef.current.remove();
      }

      // Add new marker
      const marker = new mapboxgl.Marker({ color: "#0ea371" })
        .setLngLat([lng, lat])
        .setPopup(
          new mapboxgl.Popup().setHTML(
            `<div class="p-2">
              <p class="font-semibold text-sm">${address || "Warehouse Location"}</p>
              ${pincode ? `<p class="text-xs text-gray-600">Pin: ${pincode}</p>` : ""}
            </div>`
          )
        )
        .addTo(map);

      markerRef.current = marker;
      marker.togglePopup();
    } else if (pincode && address) {
      // Try to geocode using Mapbox Geocoding API
      if (mapboxgl.accessToken) {
        (async () => {
          try {
            const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxgl.accessToken}&country=in&limit=1`;
            const response = await fetch(geocodeUrl);
            const data = await response.json();

            if (cancelled) return;

            if (data.features && data.features.length > 0) {
              const [geocodedLng, geocodedLat] = data.features[0].center;
              map.flyTo({
                center: [geocodedLng, geocodedLat],
                zoom: 12,
              });

              if (markerRef.current) {
                markerRef.current.remove();
              }

              const marker = new mapboxgl.Marker({ color: "#0ea371" })
                .setLngLat([geocodedLng, geocodedLat])
                .setPopup(
                  new mapboxgl.Popup().setHTML(
                    `<div class="p-2">
                      <p class="font-semibold text-sm">${address || "Warehouse Location"}</p>
                      ${pincode ? `<p class="text-xs text-gray-600">Pin: ${pincode}</p>` : ""}
                    </div>`
                  )
                )
                .addTo(map);

              markerRef.current = marker;
              marker.togglePopup();
              setMapError(null);
            } else {
              setMapError("Location not found. Showing India map.");
              map.flyTo({
                center: [78.9629, 20.5937],
                zoom: 5,
              });
            }
          } catch (error) {
            if (cancelled) return;
            console.error("Geocoding error:", error);
            setMapError("Could not geocode address. Showing India map.");
            map.flyTo({
              center: [78.9629, 20.5937],
              zoom: 5,
            });
          }
        })();
      } else {
        setMapError("Mapbox token not configured");
      }
    }

    return () => {
      cancelled = true;
    };
  }, [lat, lng, address, pincode]);

  if (mapError && !mapboxgl.accessToken) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-500">
        Map not available (Mapbox token not configured)
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-500">
        {mapError}
      </div>
    );
  }

  return (
    <div
      ref={mapContainer}
      className="w-full rounded-lg border border-slate-200 overflow-hidden"
      style={{ height }}
    />
  );
}
