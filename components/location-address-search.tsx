"use client";

import { Loader2, MapPin, Search } from "lucide-react";
import { useEffect, useState } from "react";
import type { PlaceSearchResult } from "@/lib/place-search";
import { parsePlaceAddress } from "@/lib/place-search";
import type { LocationFormData } from "@/components/location-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LocationAddressSearchProps {
  form: LocationFormData;
  onApply: (patch: Partial<LocationFormData>) => void;
}

export function LocationAddressSearch({
  form,
  onApply,
}: LocationAddressSearchProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<PlaceSearchResult[]>([]);

  useEffect(() => {
    if (query.trim().length < 4) {
      setResults([]);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void (async () => {
        setLoading(true);
        setError(null);
        try {
          const params = new URLSearchParams({ q: query.trim() });
          const lat = Number.parseFloat(form.latitude);
          const lng = Number.parseFloat(form.longitude);
          if (Number.isFinite(lat) && Number.isFinite(lng)) {
            params.set("lat", String(lat));
            params.set("lng", String(lng));
          }

          const res = await fetch(`/api/places/search?${params.toString()}`, {
            signal: controller.signal,
          });
          const data = (await res.json()) as {
            places?: PlaceSearchResult[];
            error?: string;
          };

          if (!res.ok) {
            throw new Error(data.error ?? "Search failed");
          }

          setResults(data.places ?? []);
        } catch (e) {
          if (e instanceof DOMException && e.name === "AbortError") return;
          setResults([]);
          setError(e instanceof Error ? e.message : "Search failed");
        } finally {
          setLoading(false);
        }
      })();
    }, 600);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query, form.latitude, form.longitude]);

  function applyPlace(place: PlaceSearchResult) {
    const parsed = parsePlaceAddress(place.address);
    onApply({
      name: place.title,
      addressLine1: parsed.addressLine1 || place.address,
      city: parsed.city,
      state: parsed.state,
      zip: parsed.zip,
      latitude: String(place.latitude),
      longitude: String(place.longitude),
    });
    setQuery(place.title);
    setResults([]);
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor="loc-place-search" className="text-[#e7e9ea]">
        Search address (optional — uses SerpAPI free tier)
      </Label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-[#71767b]"
          strokeWidth={1.75}
        />
        <Input
          id="loc-place-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type 4+ characters, or enter address manually below…"
          className="rounded-none border-[#2f3336] bg-[#16181c] pl-9 text-white"
        />
        {loading && (
          <Loader2 className="absolute top-1/2 right-2.5 size-4 -translate-y-1/2 animate-spin text-[#71767b]" />
        )}
      </div>

      {error ? (
        <p className="text-xs text-[#f4212e]">{error}</p>
      ) : null}

      {results.length > 0 ? (
        <ul className="max-h-44 overflow-y-auto border border-[#2f3336] bg-[#080808]">
          {results.map((place) => (
            <li key={`${place.placeId ?? place.title}-${place.latitude}`}>
              <button
                type="button"
                className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-[#16181c]"
                onClick={() => applyPlace(place)}
              >
                <MapPin
                  className="mt-0.5 size-4 shrink-0 text-[#1d9bf0]"
                  strokeWidth={1.75}
                />
                <span>
                  <span className="block font-medium text-[#e7e9ea]">
                    {place.title}
                  </span>
                  {place.address ? (
                    <span className="block text-xs text-[#71767b]">
                      {place.address}
                    </span>
                  ) : null}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
