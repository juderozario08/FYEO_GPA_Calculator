import { useLocalStorage } from '../hooks/useLocalStorage';
import { gradeForPercent, toNum, tidy } from '../lib/grades';
import { newId } from '../lib/id';
import { CardHeader, Stat, CardFooter, TrashIcon } from './ui';
import { confirmReset } from '../lib/confirm';

const makeRow = () => ({ id: newId(), name: '', credits: '1', percentage: '' });

const ROW_GRID =
  'grid grid-cols-[1fr_1fr_4rem_2.5rem] items-end gap-3 sm:grid-cols-[1fr_6rem_7rem_4.5rem_2.5rem] sm:items-center';

export default function TermGpaCalc() {
  const [rows, setRows] = useLocalStorage('term-courses', () => [makeRow()]);

  const update = (id, field, value) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  const add = () => setRows((prev) => [...prev, makeRow()]);
  const remove = (id) => setRows((prev) => prev.filter((r) => r.id !== id));
  const reset = () => {
    if (!confirmReset(rows.some((r) => r.name || r.percentage !== ''))) return;
    setRows([makeRow()]);
  };

  // --- Math (live: no Calculate button needed) ---
  const computed = rows.map((r) => {
    const pct = toNum(r.percentage);
    const credits = toNum(r.credits);
    const pctInvalid = pct !== null && (pct < 0 || pct > 100);
    const creditsInvalid = credits !== null && credits < 0;
    const grade = pct !== null && !pctInvalid ? gradeForPercent(pct) : null;
    return { ...r, grade, credits, pctInvalid, creditsInvalid, counts: Boolean(grade) && credits > 0 };
  });
  const counted = computed.filter((r) => r.counts);
  const totalCredits = counted.reduce((sum, r) => sum + r.credits, 0);
  const totalPoints = counted.reduce((sum, r) => sum + r.credits * r.grade.points, 0);
  const termGpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '—';

  return (
    <section className="section-card" aria-labelledby="term-title">
      <CardHeader title={<span id="term-title">Term GPA Calculator</span>} description="Enter your final percentage in each course to see your term GPA." />

      <div className="mt-6 grid grid-cols-2 gap-4">
        <Stat label="Term GPA" value={termGpa} sub={`out of 4.33 · ${counted.length} of ${rows.length} course${rows.length === 1 ? '' : 's'} counted`} />
        <Stat label="Credits counted" value={tidy(totalCredits)} tone="text-ink" sub="billing units" />
      </div>

      <div className="panel mt-6">
        <div className={`${ROW_GRID} hidden px-1 pb-2 text-sm font-bold text-ink-muted sm:grid`}>
          <span>Course</span><span>Credits</span><span>Final %</span><span className="text-center">Letter</span><span />
        </div>
        <div className="divide-y divide-[#ececf3]">
          {computed.map((r, i) => {
            const label = r.name || `course ${i + 1}`;
            return (
              <div key={r.id} className={`${ROW_GRID} px-1 py-3`}>
                <label className="col-span-4 sm:col-span-1">
                  <span className="field-label sm:hidden">Course</span>
                  <input type="text" placeholder="e.g. MTH 140" value={r.name} aria-label={`Course name, row ${i + 1}`}
                    onChange={(e) => update(r.id, 'name', e.target.value)} onFocus={(e) => e.target.select()} className="field" />
                </label>
                <label>
                  <span className="field-label sm:hidden">Credits</span>
                  <input type="number" inputMode="decimal" min="0" step="0.5" value={rows[i].credits} aria-label={`${label} credits`}
                    aria-invalid={r.creditsInvalid}
                    onChange={(e) => update(r.id, 'credits', e.target.value)} onFocus={(e) => e.target.select()} className="field" />
                </label>
                <label>
                  <span className="field-label sm:hidden">Final %</span>
                  <input type="number" inputMode="decimal" min="0" max="100" placeholder="e.g. 85" value={r.percentage}
                    aria-label={`${label} final percentage`} aria-invalid={r.pctInvalid}
                    onChange={(e) => update(r.id, 'percentage', e.target.value)} onFocus={(e) => e.target.select()} className="field" />
                </label>
                <div className="flex min-h-11 items-center justify-center" aria-label={`${label} letter grade`}>
                  {r.grade
                    ? <span className="chip text-base text-accent" title={`${r.grade.points.toFixed(2)} grade points`}>{r.grade.letter}</span>
                    : <span className="text-slate-300">—</span>}
                </div>
                <button type="button" onClick={() => remove(r.id)} disabled={rows.length === 1}
                  className="icon-btn" aria-label={`Remove ${label}`}>
                  <TrashIcon />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <CardFooter addLabel="Add course" onAdd={add} onReset={reset} />
    </section>
  );
}
