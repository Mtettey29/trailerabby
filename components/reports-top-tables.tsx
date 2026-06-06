import Link from "next/link";
import { PanelCard } from "@/components/panel-card";
import {
  topDriversByMovements,
  topLocationsByMovements,
  topTrailerUtilization,
} from "@/lib/reports";
import type { Trailer } from "@/lib/types";

interface ReportsTopTablesProps {
  trailers: Trailer[];
}

function ViewLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="text-xs text-[#1d9bf0] hover:underline"
    >
      View full report →
    </Link>
  );
}

export function ReportsTopTables({ trailers }: ReportsTopTablesProps) {
  const utilization = topTrailerUtilization(trailers);
  const locations = topLocationsByMovements(trailers);
  const drivers = topDriversByMovements(trailers);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <PanelCard title="Trailer utilization (top 5)" bodyClassName="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2f3336] text-left text-xs text-[#71767b]">
              <th className="px-4 py-2 font-normal">Trailer ID</th>
              <th className="px-4 py-2 font-normal">Utilization</th>
              <th className="px-4 py-2 text-right font-normal">Trips</th>
            </tr>
          </thead>
          <tbody>
            {utilization.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-8 text-center text-[#71767b]"
                >
                  No trailer data
                </td>
              </tr>
            ) : (
              utilization.map((row) => (
                <tr key={row.trailerNumber} className="border-b border-[#2f3336]">
                  <td className="px-4 py-3 font-mono text-white">
                    {row.trailerNumber}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-sm bg-[#16181c]">
                        <div
                          className="h-full rounded-sm bg-[#1d9bf0]"
                          style={{ width: `${row.utilization}%` }}
                        />
                      </div>
                      <span className="shrink-0 tabular-nums text-xs text-[#e7e9ea]">
                        {row.utilization}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-[#71767b]">
                    {row.trips}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="border-t border-[#2f3336] px-4 py-3">
          <ViewLink href="/reports?tab=trailer_utilization" />
        </div>
      </PanelCard>

      <PanelCard title="Top locations by movements" bodyClassName="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2f3336] text-left text-xs text-[#71767b]">
              <th className="px-4 py-2 font-normal">Location</th>
              <th className="px-4 py-2 font-normal">Movements</th>
              <th className="px-4 py-2 text-right font-normal">% of total</th>
            </tr>
          </thead>
          <tbody>
            {locations.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-8 text-center text-[#71767b]"
                >
                  No location data
                </td>
              </tr>
            ) : (
              locations.map((row) => (
                <tr key={row.location} className="border-b border-[#2f3336]">
                  <td className="px-4 py-3 text-white">{row.location}</td>
                  <td className="px-4 py-3 tabular-nums text-[#e7e9ea]">
                    {row.count}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-[#71767b]">
                    {row.pct}%
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="border-t border-[#2f3336] px-4 py-3">
          <ViewLink href="/locations" />
        </div>
      </PanelCard>

      <PanelCard title="Top drivers by movements" bodyClassName="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2f3336] text-left text-xs text-[#71767b]">
              <th className="px-4 py-2 font-normal">Driver</th>
              <th className="px-4 py-2 text-right font-normal">Movements</th>
            </tr>
          </thead>
          <tbody>
            {drivers.length === 0 ? (
              <tr>
                <td
                  colSpan={2}
                  className="px-4 py-8 text-center text-[#71767b]"
                >
                  No driver assignments
                </td>
              </tr>
            ) : (
              drivers.map((row) => (
                <tr key={row.name} className="border-b border-[#2f3336]">
                  <td className="px-4 py-3 text-white">{row.name}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-[#e7e9ea]">
                    {row.count}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="border-t border-[#2f3336] px-4 py-3">
          <ViewLink href="/reports?tab=driver_performance" />
        </div>
      </PanelCard>
    </div>
  );
}
