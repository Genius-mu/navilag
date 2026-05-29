"use client";

/**
 * NaviLag — Turn-by-turn route steps
 *
 * Renders the steps[] from OSRM as a collapsible list. Each step shows:
 *   - A numbered badge
 *   - A maneuver icon hint
 *   - The instruction text
 *   - Distance for that segment
 *
 * Designed to live INSIDE the location details panel — appears when a
 * route is active and pointing at the currently-shown location.
 */

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowUpRight,
  ArrowUpLeft,
  Footprints,
  MapPin,
} from "lucide-react";
import { formatDistance } from "@/lib/utils/distance";
import type { Route } from "@/lib/data/types";

export default function RouteSteps({ route }: { route: Route }) {
  const [expanded, setExpanded] = useState(false);
  const steps = route.steps ?? [];

  if (steps.length === 0) return null;

  const visibleSteps = expanded ? steps : steps.slice(0, 3);
  const hiddenCount = steps.length - visibleSteps.length;

  return (
    <div className="mt-5 overflow-hidden rounded-lg border border-border-subtle bg-bg-elevated/40">
      <div className="flex items-center justify-between border-b border-border-subtle px-3 py-2">
        <div className="flex items-center gap-1.5">
          <Footprints className="h-3.5 w-3.5 text-accent" />
          <span className="font-display text-[10px] font-medium uppercase tracking-[0.16em] text-text-secondary">
            Turn-by-turn ({steps.length})
          </span>
        </div>
      </div>

      <ol className="divide-y divide-border-subtle">
        {visibleSteps.map((step, i) => (
          <li
            key={`${i}-${step.coords.lat}`}
            className="flex items-start gap-3 px-3 py-2.5"
          >
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-border-subtle bg-bg-base font-display text-[10px] font-semibold text-text-secondary tabular">
              {i + 1}
            </span>
            <div className="flex-shrink-0 pt-0.5 text-text-muted">
              <ManeuverIcon instruction={step.instruction} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm leading-snug text-text-primary">
                {step.instruction}
              </div>
              {step.distanceMeters > 0 && (
                <div className="mt-0.5 text-[11px] text-text-muted tabular">
                  {formatDistance(step.distanceMeters)}
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>

      {steps.length > 3 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-center gap-1.5 border-t border-border-subtle px-3 py-2 text-[11px] font-medium text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3" />
              <span>Show fewer steps</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              <span>
                Show {hiddenCount} more {hiddenCount === 1 ? "step" : "steps"}
              </span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

/**
 * Pick an icon based on the instruction text. We don't have access to the
 * raw OSRM maneuver type here (we already flattened it to a string), so we
 * do a simple keyword scan. It's good enough for visual rhythm.
 */
function ManeuverIcon({ instruction }: { instruction: string }) {
  const lower = instruction.toLowerCase();
  if (lower.includes("arrive")) {
    return <MapPin className="h-3.5 w-3.5" />;
  }
  if (lower.includes("right")) {
    return <ArrowUpRight className="h-3.5 w-3.5" />;
  }
  if (lower.includes("left")) {
    return <ArrowUpLeft className="h-3.5 w-3.5" />;
  }
  return <ArrowUp className="h-3.5 w-3.5" />;
}
