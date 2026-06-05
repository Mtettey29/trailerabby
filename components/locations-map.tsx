"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import {
  countTrailersAtLocation,
  formatLocationAddress,
  getLocationMarkerColor,
} from "@/lib/location-display";
import type { Location, Trailer } from "@/lib/types";
import "leaflet/dist/leaflet.css";

interface LocationsMapProps {
  locations: Location[];
  trailers: Trailer[];
  selectedId: string | null;
  onSelect: (location: Location) => void;
}

const DEFAULT_CENTER: [number, number] = [33.749, -84.388];
const DEFAULT_ZOOM = 9;

export function LocationsMap({
  locations,
  trailers,
  selectedId,
  onSelect,
}: LocationsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<LeafletMarker[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let cancelled = false;

    void import("leaflet").then((L) => {
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        zoomControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      mapRef.current = map;
    });

    return () => {
      cancelled = true;
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    void import("leaflet").then((L) => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      if (locations.length === 0) return;

      const bounds = L.latLngBounds([]);

      locations.forEach((location) => {
        const count = countTrailersAtLocation(location, trailers);
        const color = getLocationMarkerColor(location.type);
        const selected = location.id === selectedId;
        const label = count > 0 ? String(count) : "•";

        const icon = L.divIcon({
          className: "",
          html: `<div style="
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: ${color};
            color: white;
            font-size: 13px;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            border: ${selected ? "3px solid white" : "2px solid rgba(0,0,0,0.15)"};
            box-shadow: 0 2px 6px rgba(0,0,0,0.25);
          ">${label}</div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const address = formatLocationAddress(location).replace(/\n/g, "<br>");
        const tooltip = `<strong>${location.name}</strong><br>${address}`;

        const marker = L.marker([location.latitude, location.longitude], {
          icon,
        })
          .addTo(map)
          .bindTooltip(tooltip, { direction: "top", offset: [0, -8] })
          .on("click", () => onSelect(location));

        markersRef.current.push(marker);
        bounds.extend([location.latitude, location.longitude]);
      });

      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 11 });
      }
    });
  }, [locations, trailers, selectedId, onSelect]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;

    const location = locations.find((l) => l.id === selectedId);
    if (!location) return;

    map.panTo([location.latitude, location.longitude], { animate: true });
  }, [selectedId, locations]);

  return (
    <div
      ref={containerRef}
      className="h-full min-h-[320px] w-full bg-[#e8ecef] lg:min-h-[560px]"
      aria-label="Locations map"
    />
  );
}
