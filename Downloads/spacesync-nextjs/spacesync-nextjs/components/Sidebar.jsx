"use client";

import { useMemo } from "react";

const TYPES = ["Room", "Desk", "Equipment", "Vehicle", "Court", "Other"];

export default function Sidebar({ resources, filters, onChange }) {
  const buildings = useMemo(() => [...new Set(resources.map((r) => r.building))].sort(), [resources]);
  const tags = useMemo(() => [...new Set(resources.flatMap((r) => r.tags || []))].sort(), [resources]);

  const toggleType = (type) => onChange({ ...filters, type: filters.type === type ? "" : type });
  const toggleTag = (tag) => onChange({ ...filters, tag: filters.tag === tag ? "" : tag });

  const chipClass = (active) =>
    `rounded-full border px-3 py-1.5 text-sm transition-colors ${
      active ? "bg-primary border-primary text-white" : "bg-card border-border text-ink hover:border-primary"
    }`;

  return (
    <aside className="flex flex-col gap-7 border-r border-border bg-card p-6">
      <div>
        <div className="font-display text-xl font-bold tracking-tight">
          Space<span className="text-primary">Sync</span>
        </div>
        <div className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted">Calendar &amp; Booking</div>
      </div>

      <div className="flex flex-col gap-2.5">
        <h3 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted">Resource type</h3>
        <div className="flex flex-wrap gap-1.5">
          {TYPES.map((type) => (
            <button key={type} className={chipClass(filters.type === type)} onClick={() => toggleType(type)}>
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <h3 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted">Building</h3>
        <select
          className="rounded-lg border border-border bg-card px-2.5 py-2 text-sm text-ink"
          value={filters.building}
          onChange={(e) => onChange({ ...filters, building: e.target.value })}
        >
          <option value="">All buildings</option>
          {buildings.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <h3 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted">Tag</h3>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <button key={tag} className={chipClass(filters.tag === tag)} onClick={() => toggleTag(tag)}>
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto flex flex-col gap-2 border-t border-border pt-4 text-xs text-muted">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 flex-shrink-0 rounded-sm bg-primary" />
          Confirmed booking
        </div>
        <div className="flex items-center gap-2">
          <span className="legend-swatch buffer h-3 w-3 flex-shrink-0 rounded-sm" />
          Buffer zone (per-resource gap)
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 flex-shrink-0 rounded-sm bg-teal opacity-40" />
          Slot you&apos;re dragging
        </div>
      </div>
    </aside>
  );
}
