import TitleCard from './TitleCard.jsx';
import { LoadingGrid, EmptyState } from './States.jsx';

export default function TitleRow({ heading, titles }) {
  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="font-display text-2xl text-bone mb-4">{heading}</h2>
      {titles === null && <LoadingGrid count={5} />}
      {titles && titles.length === 0 && <EmptyState title="Nothing added here yet" />}
      {titles && titles.length > 0 && (
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 snap-x">
          {titles.map((t) => (
            <div key={t.id} className="w-36 sm:w-44 shrink-0 snap-start">
              <TitleCard title={t} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
      }
