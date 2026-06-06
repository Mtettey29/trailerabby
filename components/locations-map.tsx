"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap, MarkerClusterGroup } from "leaflet";
import {
  countTrailersAtLocation,
  formatLocationAddress,
  getLocationMarkerColor,
} from "@/lib/location-display";
import type { Location, Trailer } from "@/lib/types";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

interface LocationsMapProps {
  locations: Location[];
  trailers: Trailer[];
  selectedId: string | null;
  onSelect: (location: Location) => void;
}

const DEFAULT_CENTER: [number, number] = [33.749, -84.388];
const DEFAULT_ZOOM = 9;

/** Free dark tiles (CARTO + OSM). No API key — avoids Mapbox billing. */
const FREE_DARK_TILES =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const FREE_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

export function LocationsMap({
  locations,
  trailers,
  selectedId,
  onSelect,
}: LocationsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const clusterRef = useRef<MarkerClusterGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let cancelled = false;

    void import("leaflet").then((L) => {
      void import("leaflet.markercluster").then(() => {
        if (cancelled || !containerRef.current || mapRef.current) return;

        const map = L.map(containerRef.current, {
          center: DEFAULT_CENTER,
          zoom: DEFAULT_ZOOM,
          zoomControl: false,
        });

        L.tileLayer(FREE_DARK_TILES, {
          attribution: FREE_TILE_ATTRIBUTION,
          subdomains: "abcd",
          maxZoom: 19,
        }).addTo(map);

        L.control.zoom({ position: "bottomright" }).addTo(map);

        const cluster = L.markerClusterGroup({
          showCoverageOnHover: false,
          maxClusterRadius: 56,
          iconCreateFunction: (group) => {
            const count = group.getChildCount();
            const size = count < 10 ? 36 : count < 100 ? 42 : 48;
            return L.divIcon({
              html: `<div style="
                width: ${size}px;
                height: ${size}px;
                border-radius: 0;
                background: #1d9bf0;
                color: white;
                font-size: 13px;
                font-weight: 600;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid rgba(255,255,255,0.9);
                box-shadow: 0 2px 6px rgba(0,0,0,0.25);
              ">${count}</div>`,
              className: "",
              iconSize: [size, size],
              iconAnchor: [size / 2, size / 2],
            });
          },
        });

        map.addLayer(cluster);
        mapRef.current = map;
        clusterRef.current = cluster;
      });
    });

    return () => {
      cancelled = true;
      clusterRef.current?.clearLayers();
      clusterRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const cluster = clusterRef.current;
    if (!map || !cluster) return;

    void import("leaflet").then((L) => {
      cluster.clearLayers();

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
            border-radius: 0;
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
        const tooltip = `<strong>${location.name}</strong><br>${address}${
          count > 0 ? `<br>${count} trailer${count === 1 ? "" : "s"}` : ""
        }`;

        const marker = L.marker([location.latitude, location.longitude], {
          icon,
        })
          .bindTooltip(tooltip, { direction: "top", offset: [0, -8] })
          .on("click", () => onSelect(location));

        cluster.addLayer(marker);
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
      className="h-full min-h-[320px] w-full bg-[#0d1117] lg:min-h-[560px] [&_.marker-cluster]:rounded-none"
      aria-label="Locations map"
    />
  );
}
