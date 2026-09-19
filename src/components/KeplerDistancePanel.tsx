import type { CatalogPlanet } from "@/lib/planetLore";
import type { PlanetEstimate } from "@/types";
import { auToMillionKm, resolveStellarMass, semiMajorAxisAu } from "@/lib/kepler";
import { Scale } from "lucide-react";

interface Props {
  planet: CatalogPlanet;
  estimate: PlanetEstimate | null;
}

/**
 * Orbital distance computed live from the host-star mass and the known
 * orbital period, using Newton's version of Kepler's third law.
 */
export default function KeplerDistancePanel({ planet, estimate }: Props) {
  const resolved = resolveStellarMass(
    planet.stellarMass ?? estimate?.stellarMass ?? null,
    planet.stellarRadius,
  );
  const mass = resolved.mass;
  const period = planet.periodDays;
  const distance = semiMajorAxisAu(mass, period);

  const massLabel = mass == null ? "Data unavailable" : `${mass.toFixed(3)} M☉`;
  const massNote =
    resolved.source === "archive"
      ? "NASA archive (st_mass)"
      : resolved.source === "estimated"
        ? "Estimated from stellar radius (M ≈ R^1.25)"
        : "No stellar mass available";

  const periodLabel =
    period < 1 ? `${(period * 24).toFixed(2)} h` : `${period.toFixed(4)} days`;

  return (
    <section className="rounded-2xl border border-amber-500/25 bg-slate-900/60 backdrop-blur-md">
      <header className="flex flex-wrap items-center gap-2 border-b border-slate-800 px-5 py-3">
        <Scale className="h-4 w-4 text-amber-300" />
        <h3 className="text-sm font-semibold tracking-tight text-white">
          Orbital distance from Newton&rsquo;s form of Kepler&rsquo;s third law
        </h3>
        <span className="ml-auto rounded-full border border-slate-700 bg-slate-950/60 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-slate-400">
          Calculated live
        </span>
      </header>

      <div className="grid grid-cols-1 gap-px bg-slate-800/60 sm:grid-cols-3">
        <Cell label="Host-star mass (input)" value={massLabel} note={massNote} />
        <Cell label="Orbital period (input)" value={periodLabel} note="NASA archive (pl_orbper)" />
        <Cell
          label="Orbital distance (calculated)"
          value={distance == null ? "Data unavailable" : `${distance.toFixed(4)} AU`}
          note={
            distance == null
              ? "Needs a host-star mass"
              : `${auToMillionKm(distance).toFixed(2)} million km from ${planet.hostName}`
          }
          accent
        />
      </div>

      <div className="space-y-2 px-5 py-4">
        <p className="font-mono text-xs text-amber-200/90">a = ∛( G · M★ · P² / 4π² )</p>
        <p className="text-xs leading-relaxed text-slate-400">
          Newton derived this from his law of gravitation: the star&rsquo;s gravity supplies the
          centripetal force of the orbit, so the period depends only on the star&rsquo;s mass and the
          size of the orbit. The calculation runs in SI units (G = 6.6743&times;10⁻¹¹ m³ kg⁻¹ s⁻²,
          M☉ = 1.989&times;10³⁰ kg) and is then converted to astronomical units. The planet&rsquo;s
          own mass is negligible next to the star&rsquo;s and is left out.
        </p>
        {planet.semiMajorAxisAu != null && distance != null && (
          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
            Archive semi-major axis: {planet.semiMajorAxisAu.toFixed(4)} AU · difference{" "}
            {(
              (Math.abs(distance - planet.semiMajorAxisAu) / planet.semiMajorAxisAu) *
              100
            ).toFixed(1)}
            %
          </p>
        )}
      </div>
    </section>
  );
}

function Cell({
  label,
  value,
  note,
  accent,
}: {
  label: string;
  value: string;
  note: string;
  accent?: boolean;
}) {
  const unavailable = value === "Data unavailable";
  return (
    <div className={`px-4 py-3 ${accent ? "bg-amber-500/10" : "bg-slate-900/70"}`}>
      <div className="font-mono text-[9px] uppercase tracking-wider text-slate-500">{label}</div>
      <div
        className={`mt-1 font-mono text-base font-semibold ${
          unavailable ? "text-slate-600" : accent ? "text-amber-200" : "text-white"
        }`}
      >
        {value}
      </div>
      <div className="mt-0.5 text-[10px] text-slate-500">{note}</div>
    </div>
  );
}
