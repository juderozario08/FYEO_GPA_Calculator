import { toNum } from './grades';
import { newId } from './id';

// EXPERIMENTAL: break one assessment row (e.g. "Labs, 20%") into parts
// (Lab 1, Lab 2, ...). Every part counts equally toward the row's weight,
// and each part can be marked out of any total (e.g. 18 / 20).

export const makePart = (name = '') => ({ id: newId(), name, score: '', outOf: '100' });

export const partPercent = (p) => {
  const score = toNum(p.score);
  const outOf = toNum(p.outOf);
  if (score === null || outOf === null || outOf <= 0 || score < 0) return null;
  return (score / outOf) * 100;
};

/**
 * Summary of a row's parts, or null if the row isn't broken down.
 * `fraction` is the share of the row that has been graded: with 3 of 5 labs
 * marked, only 3/5 of the Labs weight counts as "done", so the rest stays in
 * the remaining weight used for the target-grade math.
 */
export function summarizeParts(parts) {
  if (!Array.isArray(parts) || parts.length === 0) return null;
  const pcts = parts.map(partPercent).filter((x) => x !== null);
  return {
    total: parts.length,
    graded: pcts.length,
    fraction: pcts.length / parts.length,
    average: pcts.length ? pcts.reduce((a, b) => a + b, 0) / pcts.length : null,
  };
}
