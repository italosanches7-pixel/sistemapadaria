export function Marca({ tamanho = "sm" }: { tamanho?: "sm" | "lg" }) {
  const emblema = tamanho === "lg" ? "h-12 w-12 text-2xl" : "h-9 w-9 text-lg";
  const panificadora = tamanho === "lg" ? "text-[11px] tracking-[0.28em]" : "text-[9px] tracking-[0.24em]";
  const nome = tamanho === "lg" ? "text-2xl" : "text-lg";

  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        aria-hidden
        className={`grid ${emblema} place-items-center rounded-full bg-brand-500 text-brand-900 shadow-sm`}
      >
        🌾
      </span>
      <span className="font-serif leading-none">
        <span className={`block font-semibold uppercase text-brand-600 ${panificadora}`}>Panificadora</span>
        <span className={`block font-bold text-brand-800 ${nome}`}>Pão Nobre</span>
      </span>
    </span>
  );
}
