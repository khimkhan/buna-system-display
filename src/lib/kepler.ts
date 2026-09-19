// ─────────────────────────────────────────────────────────────────────────────
// NEWTON'S VERSION OF KEPLER'S THIRD LAW
// ─────────────────────────────────────────────────────────────────────────────
// Newton derived Kepler's third law from his law of universal gravitation. For
// a planet of mass m orbiting a star of mass M, the gravitational force supplies
// the centripetal force of the orbit, which gives
//
//     P² = 4π² a³ / (G (M + m))
//
// Solving for the semi-major axis (the orbital distance):
//
//     a = ∛( G (M + m) P² / 4π² )
//
// With m ≪ M for planets, the planet mass is neglected here. Everything is
// computed in SI units and then converted to astronomical units, so the result
// is a genuine Newtonian calculation rather than the M☉/years/AU shortcut.
// ─────────────────────────────────────────────────────────────────────────────

/** Newtonian constant of gravitation, m³ kg⁻¹ s⁻². CODATA 2018. */
export const G = 6.6743e-11;
/** IAU 2015 nominal solar mass parameter GM☉ / G, in kg. */
export const M_SUN_KG = 1.98892e30;
/** IAU 2012 astronomical unit, in metres. */
export const AU_M = 1.495978707e11;
export const DAY_S = 86400;

export type StellarMassSource = 'archive' | 'estimated';

/**
 * Semi-major axis from Newton's form of Kepler's third law.
 *
 * @param stellarMassSolar host-star mass in solar masses
 * @param periodDays orbital period in days
 * @returns semi-major axis in AU, or null when the inputs are unusable
 */
export function semiMajorAxisAu(
  stellarMassSolar: number | null | undefined,
  periodDays: number | null | undefined,
): number | null {
  if (!stellarMassSolar || !periodDays) return null;
  if (!Number.isFinite(stellarMassSolar) || !Number.isFinite(periodDays)) return null;
  if (stellarMassSolar <= 0 || periodDays <= 0) return null;

  const massKg = stellarMassSolar * M_SUN_KG;
  const periodSeconds = periodDays * DAY_S;
  const aMetres = Math.cbrt((G * massKg * periodSeconds * periodSeconds) / (4 * Math.PI * Math.PI));
  return aMetres / AU_M;
}

/**
 * Main-sequence mass–radius relation R ≈ M^0.8, inverted to M ≈ R^1.25.
 * Used only when the archive has no measured stellar mass; always reported as
 * an estimate in the interface.
 */
export function estimateStellarMassFromRadius(
  stellarRadiusSolar: number | null | undefined,
): number | null {
  if (!stellarRadiusSolar || !Number.isFinite(stellarRadiusSolar) || stellarRadiusSolar <= 0) {
    return null;
  }
  return Math.pow(stellarRadiusSolar, 1.25);
}

/** Resolve the stellar mass to use, preferring the measured archive value. */
export function resolveStellarMass(
  archiveMassSolar: number | null | undefined,
  stellarRadiusSolar: number | null | undefined,
): { mass: number | null; source: StellarMassSource | null } {
  if (archiveMassSolar && archiveMassSolar > 0) return { mass: archiveMassSolar, source: 'archive' };
  const estimated = estimateStellarMassFromRadius(stellarRadiusSolar);
  if (estimated) return { mass: estimated, source: 'estimated' };
  return { mass: null, source: null };
}

/** Format an AU distance with a matching kilometre figure for readability. */
export function formatAu(au: number): string {
  return `${au.toFixed(4)} AU`;
}

export function auToMillionKm(au: number): number {
  return (au * AU_M) / 1e9;
}
