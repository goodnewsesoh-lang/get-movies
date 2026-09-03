export default function FilterBar({ genres, filters, onChange }) {
  const years = Array.from({ length: 40 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <select
        value={filters.genre}
        onChange={(e) => onChange({ ...filters, genre: e.target.value })}
        className="bg-panel border border-line rounded-lg px-3 py-2 text-sm text-bone"
      >
        <option value="">All genres</option>
        {genres.map((g) => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>

      <select
        value={filters.year}
        onChange={(e) => onChange({ ...filters, year: e.target.value })}
        className="bg-panel border border-line rounded-lg px-3 py-2 text-sm text-bone"
      >
        <option value="">All years</option>
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>

      <select
        value={filters.sort}
        onChange={(e) => onChange({ ...filters, sort: e.target.value })}
        className="bg-panel border border-line rounded-lg px-3 py-2 text-sm text-bone"
      >
        <option value="newest">Newest</option>
        <option value="rating">Top rated</option>
      </select>
    </div>
  );
      }
