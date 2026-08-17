export default function AnimeSynopsis({ sinopsis }: { sinopsis: string }) {
  return (
    <section>
      <h2
        className="text-foreground mb-4 flex items-center gap-2 text-2xl font-semibold"
        style={{ fontFamily: "'Oxanium', sans-serif" }}
      >
        <span className="w-1 h-5 rounded-full inline-block bg-primary" />
        Sinopsis
      </h2>
      <div className="p-5 rounded-2xl bg-card shadow-lg border border-border">
        <p className="text-muted-foreground leading-relaxed text-sm">{sinopsis}</p>
      </div>
    </section>
  );
}
