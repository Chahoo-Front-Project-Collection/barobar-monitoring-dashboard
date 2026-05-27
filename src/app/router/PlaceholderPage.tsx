type PlaceholderPageProps = {
  title: string;
};

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <section className="grid min-h-[420px] place-items-center border border-dashed border-stone-300 bg-white p-8 text-center">
      <div>
        <p className="text-xs font-semibold uppercase text-stone-500">MVP route</p>
        <h1 className="mt-2 text-2xl font-semibold text-stone-950">{title}</h1>
      </div>
    </section>
  );
}
