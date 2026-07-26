import React, { useMemo } from "react";

const TYPES = ["Room", "Desk", "Equipment", "Vehicle", "Court", "Other"];

export default function Sidebar({ resources, filters, onChange }) {
  const buildings = useMemo(
    () => [...new Set(resources.map((r) => r.building))].sort(),
    [resources]
  );
  const tags = useMemo(
    () => [...new Set(resources.flatMap((r) => r.tags || []))].sort(),
    [resources]
  );

  const toggleType = (type) => {
    onChange({ ...filters, type: filters.type === type ? "" : type });
  };

  const toggleTag = (tag) => {
    onChange({ ...filters, tag: filters.tag === tag ? "" : tag });
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">
          Space<span className="accent">Sync</span>
        </span>
      </div>
      <div className="brand-sub">Calendar &amp; Booking</div>

      <div className="filter-group">
        <h3>Resource type</h3>
        <div className="chip-list">
          {TYPES.map((type) => (
            <button
              key={type}
              className={`chip ${filters.type === type ? "active" : ""}`}
              onClick={() => toggleType(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h3>Building</h3>
        <select
          className="select-field"
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
        <div className="filter-group">
          <h3>Tag</h3>
          <div className="chip-list">
            {tags.map((tag) => (
              <button
                key={tag}
                className={`chip ${filters.tag === tag ? "active" : ""}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="legend">
        <div className="legend-row">
          <span className="legend-swatch" style={{ background: "var(--primary)" }} />
          Confirmed booking
        </div>
        <div className="legend-row">
          <span className="legend-swatch buffer" />
          Buffer zone (per-resource gap)
        </div>
        <div className="legend-row">
          <span className="legend-swatch" style={{ background: "var(--teal)", opacity: 0.4 }} />
          Slot you're dragging
        </div>
      </div>
    </aside>
  );
}
