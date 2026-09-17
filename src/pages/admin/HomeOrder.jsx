import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout.jsx';
import { fetchAllHomeSectionsForAdmin, updateHomeSection } from '../../lib/homeSections.js';
import { fetchAllCollectionsForAdmin, updateCollection } from '../../lib/collections.js';

export default function HomeOrder() {
  const [rows, setRows] = useState(null);

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

  const save = async (row, position) => {
    if (row.kind === 'section') {
      await updateHomeSection(row.id, { position });
    } else {
      await updateCollection(row.id, { homepage_order: position });
    }
    load();
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
        Controls the order everything appears on your homepage — built-in sections and your collections together.
      </p>

      {rows === null && <p className="text-mute">Loading…</p>}

      <div className="space-y-2 max-w-xl">
        {rows?.map((row) => (
          <div key={`${row.kind}-${row.id}`} className="flex items-center gap-3 bg-panel border border-line rounded-lg px-4 py-3">
            <input
              type="number"
              value={row.position}
              onChange={(e) => save(row, Number(e.target.value))}
              className="w-16 bg-panel2 border border-line rounded-lg px-2 py-1 text-bone text-sm"
            />
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
