import { useLocalStorage } from '../hooks/useLocalStorage';
import { GRADE_LABELS, MAX_GPA, pointsForLabel, toNum, tidy } from '../lib/grades';
import { newId } from '../lib/id';
import { CardHeader, Stat, Callout, CardFooter, TrashIcon } from './ui';
import { confirmReset } from '../lib/confirm';

const makeRow = () => ({ id: newId(), name: '', credits: '1', grade: 'A+ (90-100)', isRepeat: false, oldGrade: 'F (0-49)' });

const ROW_GRID = 'grid grid-cols-[1fr_1fr_2.5rem] items-end gap-3 sm:grid-cols-[1fr_6rem_10rem_2.5rem]';

function GradeSelect({ value, onChange, label, className = 'field' }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label} className={`${className} cursor-pointer`}>
      {GRADE_LABELS.map((g) => <option key={g} value={g}>{g}</option>)}
    </select>
  );
}

export default function CumulativeGpaCalc() {
  const [past, setPast] = useLocalStorage('cumulative-past', { credits: '', gpa: '' });
  const [rows, setRows] = useLocalStorage('cumulative-courses', () => [makeRow()]);

  const update = (id, field, value) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  const add = () => setRows((prev) => [...prev, makeRow()]);
  const remove = (id) => setRows((prev) => prev.filter((r) => r.id !== id));
  const reset = () => {
    if (!confirmReset(past.credits !== '' || past.gpa !== '' || rows.some((r) => r.name))) return;
    setPast({ credits: '', gpa: '' });
    setRows([makeRow()]);
  };

  // --- Math ---
  const priorCredits = toNum(past.credits) ?? 0;
  const priorGpaRaw = toNum(past.gpa);
  const gpaInvalid = priorGpaRaw !== null && (priorGpaRaw < 0 || priorGpaRaw > MAX_GPA);
  const priorGpa = gpaInvalid ? null : priorGpaRaw;
  const pastPoints = priorCredits * (priorGpa ?? 0);

  let termPoints = 0;
  let termCredits = 0;
  let newCredits = 0;     // credits added to the CGPA denominator
  let replacedPoints = 0; // points from earlier attempts that a repeat removes
  let repeatCredits = 0;
  for (const r of rows) {
    const credits = toNum(r.credits);
    const points = pointsForLabel(r.grade);
    if (!(credits > 0) || points === null) continue;
    termPoints += credits * points;
    termCredits += credits;
    if (r.isRepeat) {
      // The old attempt's credits are already in `priorCredits`; swap its points out.
      replacedPoints += credits * (pointsForLabel(r.oldGrade) ?? 0);
      repeatCredits += credits;
    } else {
      newCredits += credits;
    }
  }

  const repeatsExceedHistory = repeatCredits > priorCredits;
  const totalCredits = priorCredits + newCredits;
  const cgpa = !gpaInvalid && !repeatsExceedHistory && totalCredits > 0
    ? Math.max(0, (pastPoints + termPoints - replacedPoints) / totalCredits)
    : null;
  const termGpa = termCredits > 0 ? (termPoints / termCredits).toFixed(2) : '—';

  let change = null;
  if (cgpa !== null && priorGpa !== null && priorCredits > 0) {
    const delta = tidy(cgpa - priorGpa);
    change = delta === 0 ? 'No change from your current CGPA'
      : `${delta > 0 ? '▲' : '▼'} ${Math.abs(delta).toFixed(2)} from ${priorGpa.toFixed(2)}`;
  }

  return (
    <section className="section-card" aria-labelledby="cumulative-title">
      <CardHeader title={<span id="cumulative-title">Cumulative GPA Calculator</span>} description="See how this term's grades would change your overall CGPA." />

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        <Stat label="New CGPA" value={cgpa !== null ? cgpa.toFixed(2) : '—'} sub={change ?? 'out of 4.33'} className="col-span-2 md:col-span-1" />
        <Stat label="This term's GPA" value={termGpa} tone="text-ink" />
        <Stat label="Total credits" value={tidy(totalCredits)} tone="text-ink" />
      </div>

      {(gpaInvalid || repeatsExceedHistory) && (
        <div className="mt-5 space-y-3">
          {gpaInvalid && <Callout tone="danger">Your current CGPA must be between 0 and {MAX_GPA}.</Callout>}
          {repeatsExceedHistory && (
            <Callout tone="danger">
              You've marked {tidy(repeatCredits)} credits as repeats, but your prior credits are {tidy(priorCredits)}. Enter your prior credits so the old attempts can be replaced.
            </Callout>
          )}
        </div>
      )}

      <h3 className="mt-8 mb-3 text-lg font-bold">Your record so far</h3>
      <div className="panel grid grid-cols-2 gap-4">
        <label>
          <span className="field-label">Credits so far <span className="field-hint block text-xs">Billing units before this term</span></span>
          <input type="number" inputMode="decimal" min="0" step="0.5" placeholder="e.g. 10" value={past.credits}
            onChange={(e) => setPast((p) => ({ ...p, credits: e.target.value }))} onFocus={(e) => e.target.select()} className="field" />
        </label>
        <label>
          <span className="field-label">Current CGPA <span className="field-hint block text-xs">From your transcript</span></span>
          <input type="number" inputMode="decimal" min="0" max={MAX_GPA} step="0.01" placeholder="e.g. 3.25" value={past.gpa}
            aria-invalid={gpaInvalid}
            onChange={(e) => setPast((p) => ({ ...p, gpa: e.target.value }))} onFocus={(e) => e.target.select()} className="field" />
        </label>
      </div>

      <h3 className="mt-8 mb-1 text-lg font-bold">This term's courses</h3>
      <p className="mb-3 text-sm text-white/85">Add the courses you're taking and the grade you expect in each.</p>
      <div className="panel divide-y divide-[#ececf3]">
        {rows.map((r, i) => {
          const label = r.name || `course ${i + 1}`;
          return (
            <div key={r.id} className="px-1 py-4 first:pt-1 last:pb-1">
              <div className={ROW_GRID}>
                <label className="col-span-3 sm:col-span-1">
                  <span className="field-label">Course <span className="field-hint">(optional)</span></span>
                  <input type="text" placeholder="e.g. MTH 140" value={r.name}
                    onChange={(e) => update(r.id, 'name', e.target.value)} onFocus={(e) => e.target.select()} className="field" />
                </label>
                <label>
                  <span className="field-label">Credits</span>
                  <input type="number" inputMode="decimal" min="0" step="0.5" value={r.credits}
                    onChange={(e) => update(r.id, 'credits', e.target.value)} onFocus={(e) => e.target.select()} className="field" />
                </label>
                <div>
                  <span className="field-label" aria-hidden="true">Expected grade</span>
                  <GradeSelect value={r.grade} onChange={(v) => update(r.id, 'grade', v)} label={`${label} expected grade`} />
                </div>
                <button type="button" onClick={() => remove(r.id)} disabled={rows.length === 1}
                  className="icon-btn" aria-label={`Remove ${label}`}>
                  <TrashIcon />
                </button>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                  <input type="checkbox" checked={r.isRepeat} onChange={(e) => update(r.id, 'isRepeat', e.target.checked)}
                    className="h-4 w-4 shrink-0 accent-accent" />
                  Repeating this course <span className="text-ink-muted">(replaces the earlier attempt)</span>
                </label>
                {r.isRepeat && (
                  <label className="flex items-center gap-2 text-sm font-semibold animate-fade-in">
                    Earlier grade:
                    <GradeSelect value={r.oldGrade} onChange={(v) => update(r.id, 'oldGrade', v)} label={`${label} earlier grade`}
                      className="rounded border border-amber-line bg-amber-soft px-2 py-1 text-sm" />
                  </label>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <CardFooter addLabel="Add course" onAdd={add} onReset={reset} />
    </section>
  );
}
