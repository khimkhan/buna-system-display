import { Coffee, Star, Globe2, Landmark, Sparkles } from 'lucide-react';

/**
 * Featured system panel pinned to the very top of the interface.
 *
 * Buna (HD 16175) and its planet Abol were named by Ethiopia during the IAU's
 * NameExoWorlds campaign. Cultural facts only — no measurements here.
 */
export default function BunaSystemPanel() {
  return (
    <section
      aria-label="Featured system: Buna (HD 16175)"
      className="mb-8 overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-slate-900/80 to-slate-900/60 backdrop-blur-md"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/20 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/15 p-2.5">
            <Coffee className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">
              Featured system: Buna &amp; Abol
            </h2>
            <p className="font-mono text-[11px] uppercase tracking-wider text-amber-400/80">
              Named by Ethiopia · IAU NameExoWorlds campaign
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-amber-300">
          <Sparkles className="h-3 w-3" />
          Cultural highlight
        </span>
      </div>

      <dl className="grid grid-cols-1 gap-px bg-amber-500/10 sm:grid-cols-2 lg:grid-cols-4">
        <Detail
          icon={<Star className="h-4 w-4 text-amber-400" />}
          label="Host star"
          value="Buna"
          sub="Cataloged as HD 16175 — a yellow-white dwarf star"
        />
        <Detail
          icon={<Globe2 className="h-4 w-4 text-amber-400" />}
          label="Planet"
          value="Abol"
          sub="A gas giant with a mass several times that of Jupiter"
        />
        <Detail
          icon={<Landmark className="h-4 w-4 text-amber-400" />}
          label="Naming origin"
          value="Ethiopia"
          sub="Named during the IAU NameExoWorlds campaign"
        />
        <Detail
          icon={<Coffee className="h-4 w-4 text-amber-400" />}
          label="Cultural meaning"
          value="“Buna” = coffee"
          sub="“Abol” honors the first of the three traditional rounds of coffee poured during an Ethiopian coffee ceremony"
        />
      </dl>
    </section>
  );
}

function Detail({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="h-full bg-slate-900/70 px-5 py-4 backdrop-blur-md">
      <dt className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-slate-500">
        {icon}
        {label}
      </dt>
      <dd className="mt-1.5 text-base font-bold text-amber-200">{value}</dd>
      <p className="mt-1 text-xs leading-relaxed text-slate-400">{sub}</p>
    </div>
  );
}
