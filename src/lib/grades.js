// TMU undergraduate grading scale (4.33), per Senate Policy 170.
export const GRADE_SCALE = [
  { letter: 'A+', min: 90, max: 100, points: 4.33 },
  { letter: 'A', min: 85, max: 89, points: 4.0 },
  { letter: 'A-', min: 80, max: 84, points: 3.67 },
  { letter: 'B+', min: 77, max: 79, points: 3.33 },
  { letter: 'B', min: 73, max: 76, points: 3.0 },
  { letter: 'B-', min: 70, max: 72, points: 2.67 },
  { letter: 'C+', min: 67, max: 69, points: 2.33 },
  { letter: 'C', min: 63, max: 66, points: 2.0 },
  { letter: 'C-', min: 60, max: 62, points: 1.67 },
  { letter: 'D+', min: 57, max: 59, points: 1.33 },
  { letter: 'D', min: 53, max: 56, points: 1.0 },
  { letter: 'D-', min: 50, max: 52, points: 0.67 },
  { letter: 'F', min: 0, max: 49, points: 0 },
];

export const MAX_GPA = 4.33;

// Labels like "A+ (90-100)". These are also the values saved in localStorage
// by the cumulative calculator, so keep the format stable.
export const gradeLabel = (g) => `${g.letter} (${g.min}-${g.max})`;
export const GRADE_LABELS = GRADE_SCALE.map(gradeLabel);
const pointsByLabel = Object.fromEntries(GRADE_SCALE.map((g) => [gradeLabel(g), g.points]));

export const pointsForLabel = (label) => pointsByLabel[label] ?? null;

export function gradeForPercent(pct) {
  return GRADE_SCALE.find((g) => pct >= g.min) ?? GRADE_SCALE[GRADE_SCALE.length - 1];
}

/** Parse a form value; returns null for blank or non-numeric input. */
export function toNum(value) {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Round for display without trailing float noise (33.300000004 -> 33.3). */
export const tidy = (n, digits = 2) => Number(n.toFixed(digits));
