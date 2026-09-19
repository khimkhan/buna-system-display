import type { BlsPeak, LightCurve, PlanetEstimate } from '@/types';
import { resolveStellarMass, semiMajorAxisAu as keplerSemiMajorAxis } from './kepler';

// ─────────────────────────────────────────────────────────────────────────────
// PLANET PARAMETER ESTIMATOR
// ─────────────────────────────────────────────────────────────────────────────
// From the BLS detection results, we estimate physical planet parameters.
//
// KEY FORMULAS
//
// 1. ORBITAL PERIOD
//    Directly from the BLS best-fit period. The uncertainty is roughly
//    P / (2π × N_transits × SNR), following the scaling from the timing
//    precision of individual transits (Carter et al. 2008).
//
// 2. PLANET RADIUS
//    During a transit, the planet blocks a fraction of starlight equal to the
//    ratio of areas:
//       δ = (R_p / R_★)²
//    Therefore:
//       R_p = R_★ × √δ
//    where δ is the transit depth (fractional flux decrease) and R_★ is the
//    stellar radius. We convert to Earth radii using:
//       R_earth = 0.009168 R_sun  (IAU 2015 nominal solar radius)
//
//    The stellar radius comes from the target's catalog metadata. If it's not
//    available, we flag it and cannot compute R_p.
//
// 3. SEMI-MAJOR AXIS (orbital distance)
//    Newton's version of Kepler's third law, derived from his law of
//    gravitation, for a planet orbiting a star of mass M_★:
//       P² = 4π² a³ / (G M_★)   ⟹   a = ∛( G M_★ P² / 4π² )
//    The host-star mass is a real input parameter here: it comes from the NASA
//    archive (st_mass) when published, otherwise from the main-sequence
//    relation M_★ ≈ R_★^1.25, and the provenance is reported in the UI.
//
// 4. EQUILIBRIUM TEMPERATURE (if stellar T_eff is known)
//    T_eq = T_eff × √(R_★ / (2a)) × (1 - α)^0.25
//    Assuming Bond albedo α = 0.3 (Earth-like) and uniform heat redistribution.
//
// 5. JUPITER RADIUS CONVERSION
//    R_jup = 0.10049 R_sun  (IAU 2015)
// ─────────────────────────────────────────────────────────────────────────────

// IAU 2015 nominal values
const R_SUN_TO_EARTH = 109.2;   // 1 R_sun = 109.2 R_earth
const R_SUN_TO_JUPITER = 9.95;  // 1 R_sun = 9.95 R_jup
const AU_IN_SOLAR_RADII = 215.0; // 1 AU = 215 R_sun

/**
 * Estimate planet parameters from BLS detection results.
 */
export function estimatePlanet(
  peak: BlsPeak,
  curve: LightCurve
): PlanetEstimate {
  const period = peak.period;
  const depth = peak.depth;
  const duration = peak.duration;
  const snr = peak.snr;

  // ── Orbital period uncertainty ─────────────────────────────────────────────
  // Rough estimate: timing precision improves with more transits and higher SNR
  const timeSpan = curve.fluxPoints[curve.fluxPoints.length - 1].time - curve.fluxPoints[0].time;
  const nTransits = Math.max(1, Math.floor(timeSpan / period));
  const periodError = period / (2 * Math.PI * nTransits * Math.max(snr, 1));

  // ── Planet radius ───────────────────────────────────────────────────────────
  // R_p = R_★ × √δ
  let stellarRadius = curve.stellarRadius;
  let stellarRadiusSource = 'Not available';
  let planetRadius = 0;
  let planetRadiusError = 0;
  let planetRadiusJupiter = 0;

  if (stellarRadius && stellarRadius > 0) {
    stellarRadiusSource = 'Catalog metadata';
    // δ is the fractional depth; R_p/R_★ = √δ
    const radiusRatio = Math.sqrt(Math.abs(depth));
    planetRadius = stellarRadius * radiusRatio * R_SUN_TO_EARTH;
    planetRadiusJupiter = stellarRadius * radiusRatio * R_SUN_TO_JUPITER;

    // Uncertainty: dominated by depth uncertainty ≈ depth/SNR
    const depthError = depth / Math.max(snr, 1);
    const radiusRatioError = 0.5 * depthError / Math.sqrt(Math.abs(depth));
    planetRadiusError = stellarRadius * radiusRatioError * R_SUN_TO_EARTH;
  }

  // ── Semi-major axis from Kepler's 3rd law ───────────────────────────────────
  // a³ = M_★ × P², with P in years, a in AU, M in solar masses
  // Approximate M_★ ≈ R_★ for main-sequence stars
  const resolvedMass = resolveStellarMass(curve.stellarMass, stellarRadius);
  const stellarMass = resolvedMass.mass ?? undefined;
  const stellarMassSource =
    curve.stellarMassSource ??
    (resolvedMass.source === 'archive'
      ? 'NASA Exoplanet Archive (st_mass)'
      : resolvedMass.source === 'estimated'
        ? 'Estimated from stellar radius'
        : undefined);
  const semiMajorAxis = keplerSemiMajorAxis(stellarMass, period) ?? undefined;

  // ── Equilibrium temperature ──────────────────────────────────────────────────
  let equilibriumTemp: number | undefined;
  if (curve.stellarTemp && stellarRadius && semiMajorAxis) {
    const aInStellarRadii = semiMajorAxis * AU_IN_SOLAR_RADII;
    const albedo = 0.3; // Earth-like Bond albedo
    equilibriumTemp = curve.stellarTemp * Math.sqrt(stellarRadius / (2 * aInStellarRadii)) * Math.pow(1 - albedo, 0.25);
  }

  return {
    orbitalPeriod: period,
    orbitalPeriodError: periodError,
    planetRadius,
    planetRadiusError,
    planetRadiusJupiter,
    transitDepth: depth,
    transitDuration: duration,
    stellarRadius: stellarRadius ?? 0,
    stellarRadiusSource,
    ...(stellarMass != null ? { stellarMass } : {}),
    ...(stellarMassSource ? { stellarMassSource } : {}),
    equilibriumTemp,
    semiMajorAxis,
  };
}
