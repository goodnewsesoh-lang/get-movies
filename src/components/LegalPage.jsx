export default function LegalPage({ title, updated, children }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl text-bone mb-2">{title}</h1>
      <p className="text-mute text-sm mb-8">Last updated: {updated}</p>
      <div className="space-y-6 text-bone/90 leading-relaxed text-sm sm:text-base">{children}</div>
    </div>
  );
}

export function Section({ heading, children }) {
  return (
    <section>
      <h2 className="text-lg text-bone mb-2">{heading}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
