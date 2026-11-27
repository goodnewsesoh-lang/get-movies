import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout.jsx';
import { fetchAllHomeSectionsForAdmin, updateHomeSection } from '../../lib/homeSections.js';
import { fetchAllCollectionsForAdmin, updateCollection } from '../../lib/collections.js';

export default function HomeOrder() {
  const [rows, setRows] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [sections, collections] = await Promise.all([
      fetchAllHomeSectionsForAdmin(),
      fetchAllCollectionsForAdmin(),
    ]);
    const sectionRows = sections.map((s) => ({
      kind: 'section',
      id: s.id,
      label: s.label,
      enabled: s.enabled,
      position: s.position,
    }));
    const collectionRows = collections.map((c) => ({
      kind: 'collection',
      id: c.id,
      label: c.name,
      enabled: c.show_on_homepage,
      position: c.homepage_order,
    }));
    setRows([...sectionRows, ...collectionRows].sort((a, b) => a.position - b.position));
  };

  useEffect(() => {
    load();
  }, []);

  const savePosition = (row, position) =>
    row.kind === 'section'
      ? updateHomeSection(row.id, { position })
      : updateCollection(row.id, { homepage_order: position });

  // Moves one row up (-1) or down (+1), then renumbers everything 1, 2, 3...
  const move = async (index, direction) => {
    const target = index + direction;
    if (busy || target < 0 || target >= rows.length) return;
    const reordered = [...rows];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    const renumbered = reordered.map((r, i) => ({ ...r, newPosition: i + 1 }));
    setRows(renumbered.map((r) => ({ ...r, position: r.newPosition })));
    setBusy(true);
    try {
      await Promise.all(
        renumbered.filter((r) => r.position !== r.newPosition).map((r) => savePosition(r, r.newPosition))
      );
    } finally {
      setBusy(false);
      load();
    }
  };

  const toggleEnabled = async (row) => {
    if (row.kind === 'section') {
      await updateHomeSection(row.id, { enabled: !row.enabled });
    } else {
      await updateCollection(row.id, { show_on_homepage: !row.enabled });
    }
    load();
  };

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl text-bone mb-2">Homepage Order</h1>
      <p className="text-mute text-sm mb-6">
        Use the arrows to move a row up or down. The top row shows first on your homepage. Built-in sections and your collections are ordered together.
      </p>

      {rows === null && <p className="text-mute">Loading…</p>}

      <div className="space-y-2 max-w-xl">
        {rows?.map((row, index) => (
          <div key={`${row.kind}-${row.id}`} className="flex items-center gap-3 bg-panel border border-line rounded-lg px-4 py-3">
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={busy || index === 0}
                aria-label={`Move ${row.label} up`}
                className="w-8 h-7 flex items-center justify-center rounded bg-panel2 border border-line text-bone text-xs disabled:opacity-30"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={busy || index === rows.length - 1}
                aria-label={`Move ${row.label} down`}
                className="w-8 h-7 flex items-center justify-center rounded bg-panel2 border border-line text-bone text-xs disabled:opacity-30"
              >
                ▼
              </button>
            </div>
            <span className="text-bone text-sm flex-1">{row.label}</span>
            <span className="text-xs text-mute">{row.kind === 'section' ? 'Built-in' : 'Collection'}</span>
            <button
              onClick={() => toggleEnabled(row)}
              className={`text-xs px-2 py-1 rounded-full border ${
                row.enabled ? 'border-violet text-violet-bright' : 'border-line text-mute'
              }`}
            >
              {row.enabled ? 'On' : 'Off'}
            </button>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
    }
