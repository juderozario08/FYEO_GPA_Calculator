import { useLocalStorage } from '../hooks/useLocalStorage';
import { gradeForPercent, toNum, tidy } from '../lib/grades';
import { newId } from '../lib/id';
import { makePart, partPercent, summarizeParts } from '../lib/parts';
import { CardHeader, Stat, Callout, CardFooter, TrashIcon } from './ui';
import { confirmReset } from '../lib/confirm';

const DEFAULT_ROWS = ['Assignment', 'Quizzes', 'Tutorials', 'Labs', 'Projects', 'Midterms', 'Final Exam'];
const makeDefaults = () => DEFAULT_ROWS.map((name) => ({ id: newId(), name, grade: '', weight: '' }));

const ROW_GRID = 'grid grid-cols-[1fr_1fr_5rem] items-end gap-3 sm:grid-cols-[1fr_8rem_8rem_5rem] sm:items-center';
const PART_GRID = 'grid grid-cols-[1fr_4.5rem_auto_4.5rem_2.5rem] items-center gap-2';

function BreakdownIcon({ className = 'h-5 w-5' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

function PartsEditor({ row, label, summary, onChange, onRemoveBreakdown }) {
  const parts = row.parts;
  const setParts = (next) => onChange(next);
  const updatePart = (id, field, value) => setParts(parts.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  const weight = toNum(row.weight);

  return (
    <div className="mt-3 rounded-xl bg-panel p-3 sm:ml-6 sm:p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded-full bg-amber-soft px-2 py-0.5 text-xs font-bold text-[#7a5b00] ring-1 ring-amber-line">Experimental</span>
        <span className="text-ink-muted">
          Each part counts equally toward <strong className="text-ink">{label}</strong>
          {weight !== null && <> ({tidy(weight / parts.length)}% each)</>}.
        </span>
      </div>

      <div className={`${PART_GRID} px-1 pb-1 text-xs font-bold text-ink-muted`}>
        <span>Part</span><span>Score</span><span /><span>Out of</span><span />
      </div>
      <div className="space-y-2">
        {parts.map((p, j) => {
          const pct = partPercent(p);
          const partLabel = p.name || `${label} part ${j + 1}`;
          return (
            <div key={p.id} className={PART_GRID}>
              <input type="text" value={p.name} placeholder={`Part ${j + 1}`} aria-label={`${label} part ${j + 1} name`}
                onChange={(e) => updatePart(p.id, 'name', e.target.value)} onFocus={(e) => e.target.select()} className="field min-h-10 bg-white" />
              <input type="number" inputMode="decimal" min="0" value={p.score} placeholder="—" aria-label={`${partLabel} score`}
                aria-invalid={toNum(p.score) !== null && toNum(p.score) < 0}
                onChange={(e) => updatePart(p.id, 'score', e.target.value)} onFocus={(e) => e.target.select()} className="field min-h-10 bg-white px-2" />
              <span className="text-ink-muted" aria-hidden="true">/</span>
              <input type="number" inputMode="decimal" min="0" value={p.outOf} aria-label={`${partLabel} out of`}
                aria-invalid={toNum(p.outOf) !== null && toNum(p.outOf) <= 0}
                onChange={(e) => updatePart(p.id, 'outOf', e.target.value)} onFocus={(e) => e.target.select()} className="field min-h-10 bg-white px-2" />
              <button type="button" onClick={() => setParts(parts.filter((x) => x.id !== p.id))} disabled={parts.length === 1}
                className="icon-btn" aria-label={`Remove ${partLabel}`} title={pct !== null ? `${pct.toFixed(1)}%` : undefined}>
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={() => setParts([...parts, makePart(`${row.name || 'Part'} ${parts.length + 1}`)])}
          className="btn btn-yellow px-3 py-1.5 text-sm">
          <span aria-hidden="true">+</span> Add part
        </button>
        <span className="text-sm font-semibold text-ink">
          {summary.average !== null ? `Average ${summary.average.toFixed(2)}% · ` : ''}{summary.graded}/{summary.total} graded
        </span>
        <button type="button" onClick={onRemoveBreakdown} className="text-sm font-semibold text-royal underline-offset-2 hover:underline">
          Remove breakdown
        </button>
      </div>
    </div>
  );
}

export default function CourseGradeCalc() {
  const [targetGrade, setTargetGrade] = useLocalStorage('course-target', '');
  const [rows, setRows] = useLocalStorage('course-assignments', makeDefaults);

  const patch = (id, changes) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...changes } : r)));
  const update = (id, field, value) => patch(id, { [field]: value });
  const add = () => setRows((prev) => [...prev, { id: newId(), name: '', grade: '', weight: '' }]);
  const remove = (id) => setRows((prev) => prev.filter((r) => r.id !== id));
  const reset = () => {
    const hasData = targetGrade !== '' || rows.some((r) => r.grade !== '' || r.weight !== '' || r.parts?.length);
    if (!confirmReset(hasData)) return;
    setTargetGrade('');
    setRows(makeDefaults());
  };

  const toggleBreakdown = (r) => {
    if (r.parts?.length) return patch(r.id, { showParts: !r.showParts });
    const base = r.name || 'Part';
    patch(r.id, { showParts: true, parts: [makePart(`${base} 1`), makePart(`${base} 2`)] });
  };

  // --- Math ---
  let totalWeight = 0;
  let completedWeight = 0;
  let earned = 0; // percentage points of the final grade already locked in
  const summaries = {};
  for (const r of rows) {
    const w = toNum(r.weight);
    const parts = summarizeParts(r.parts);
    summaries[r.id] = parts;
    if (w === null) continue;
    totalWeight += w;
    if (parts) {
      // Only the graded share of a broken-down row counts as completed.
      if (parts.average !== null) {
        completedWeight += w * parts.fraction;
        earned += parts.average * ((w * parts.fraction) / 100);
      }
    } else {
      const g = toNum(r.grade);
      if (g !== null) {
        completedWeight += w;
        earned += g * (w / 100);
      }
    }
  }
  totalWeight = tidy(totalWeight);
  completedWeight = tidy(completedWeight);

  const average = completedWeight > 0 ? (earned / completedWeight) * 100 : null;
  const averageGrade = average !== null ? gradeForPercent(average) : null;
  const remainingWeight = tidy(100 - completedWeight);

  const target = toNum(targetGrade);
  let targetMessage = null;
  if (target !== null) {
    if (remainingWeight <= 0) {
      const avg = average?.toFixed(2) ?? '0.00';
      targetMessage = average !== null && average >= target
        ? { tone: 'success', text: `Course complete! You reached your ${target}% target with ${avg}%. 🎉` }
        : { tone: 'neutral', text: `Course complete. You finished with ${avg}%, short of your ${target}% target.` };
    } else {
      const required = ((target - earned) / remainingWeight) * 100;
      if (required > 100) {
        targetMessage = { tone: 'danger', text: `Reaching ${target}% isn't possible any more — you'd need ${required.toFixed(1)}% on the remaining ${remainingWeight}% of the course.` };
      } else if (required <= 0) {
        targetMessage = { tone: 'success', text: `You've already secured ${target}%! Even a 0 on everything left keeps you there. 🎉` };
      } else {
        targetMessage = { tone: 'info', text: `To finish with ${target}%, you need to average ${required.toFixed(1)}% on the remaining ${remainingWeight}% of the course.` };
      }
    }
  }

  const weightWarning = totalWeight > 0 && totalWeight !== 100;

  return (
    <section className="section-card" aria-labelledby="course-title">
      <CardHeader title={<span id="course-title">Course Grade Calculator</span>} description="Work out your current grade and what you need on what's left.">
        <label className="flex shrink-0 items-center gap-3 rounded-xl bg-white px-4 py-2 text-ink shadow-card">
          <span className="text-sm font-bold whitespace-nowrap">Target grade %</span>
          <input
            type="number" inputMode="decimal" min="0" max="100" placeholder="e.g. 85"
            value={targetGrade}
            onChange={(e) => setTargetGrade(e.target.value)}
            onFocus={(e) => e.target.select()}
            className="field w-24 text-center font-semibold text-accent"
          />
        </label>
      </CardHeader>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <Stat
          label="Current average"
          value={average !== null ? `${average.toFixed(2)}%` : '—'}
          sub={averageGrade ? `${averageGrade.letter} · ${averageGrade.points.toFixed(2)} grade points` : 'Enter a grade and weight'}
        />
        <Stat
          label="Weight graded"
          value={`${completedWeight}%`}
          tone={completedWeight > 100 ? 'text-danger' : completedWeight === 100 ? 'text-emerald-600' : 'text-ink'}
          sub={`of ${totalWeight}% entered`}
        />
      </div>

      <div className="mt-5 space-y-3">
        {targetMessage && <Callout tone={targetMessage.tone}>{targetMessage.text}</Callout>}
        {weightWarning && (
          <Callout tone={totalWeight > 100 ? 'danger' : 'info'}>
            Your weights add up to {totalWeight}%. Check your course outline — they should total 100%.
          </Callout>
        )}
        <p className="text-sm text-white/85">
          Passing a course may have extra requirements (e.g. a minimum on the final exam) — check your course outline.
          New: use <BreakdownIcon className="inline h-4 w-4 align-[-2px]" /> to split a row into parts (e.g. Lab 1, Lab 2…).
        </p>
      </div>

      <div className="panel mt-6">
        <div className={`${ROW_GRID} hidden px-1 pb-2 text-sm font-bold text-ink-muted sm:grid`}>
          <span>Assessment</span><span>Grade (%)</span><span>Weight (%)</span><span />
        </div>
        <div className="divide-y divide-[#ececf3]">
        {rows.map((r, i) => {
          const label = r.name || `Row ${i + 1}`;
          const parts = summaries[r.id];
          return (
            <div key={r.id} className="px-1 py-3">
              <div className={ROW_GRID}>
                <label className="col-span-3 sm:col-span-1">
                  <span className="field-label sm:hidden">Assessment</span>
                  <input type="text" value={r.name} placeholder="e.g. Lab 1" aria-label={`Assessment name, row ${i + 1}`}
                    onChange={(e) => update(r.id, 'name', e.target.value)} onFocus={(e) => e.target.select()} className="field" />
                </label>
                <label>
                  <span className="field-label sm:hidden">Grade (%)</span>
                  {parts ? (
                    <input type="text" readOnly aria-label={`${label} grade, from ${parts.graded} of ${parts.total} parts`}
                      value={parts.average !== null ? tidy(parts.average) : '—'}
                      title={`Average of ${parts.graded} of ${parts.total} graded parts`}
                      className="field cursor-default bg-sidebar font-semibold text-accent" />
                  ) : (
                    <input type="number" inputMode="decimal" min="0" value={r.grade} placeholder="—" aria-label={`${label} grade`}
                      aria-invalid={toNum(r.grade) !== null && toNum(r.grade) < 0}
                      onChange={(e) => update(r.id, 'grade', e.target.value)} onFocus={(e) => e.target.select()} className="field" />
                  )}
                </label>
                <label>
                  <span className="field-label sm:hidden">Weight (%)</span>
                  <input type="number" inputMode="decimal" min="0" max="100" value={r.weight} placeholder="—" aria-label={`${label} weight`}
                    aria-invalid={toNum(r.weight) !== null && (toNum(r.weight) < 0 || toNum(r.weight) > 100)}
                    onChange={(e) => update(r.id, 'weight', e.target.value)} onFocus={(e) => e.target.select()} className="field" />
                </label>
                <div className="flex">
                  <button type="button" onClick={() => toggleBreakdown(r)}
                    className={`icon-btn hover:bg-sidebar hover:text-accent ${parts ? 'text-accent' : ''}`}
                    aria-expanded={Boolean(parts && r.showParts)}
                    aria-label={parts ? `${r.showParts ? 'Hide' : 'Show'} parts of ${label}` : `Split ${label} into parts`}
                    title={parts ? `${r.showParts ? 'Hide' : 'Show'} parts (${parts.graded}/${parts.total} graded)` : 'Split into parts'}>
                    <BreakdownIcon />
                  </button>
                  <button type="button" onClick={() => remove(r.id)} disabled={rows.length === 1}
                    className="icon-btn" aria-label={`Remove ${label}`}>
                    <TrashIcon />
                  </button>
                </div>
              </div>

              {parts && !r.showParts && (
                <p className="mt-1 px-1 text-xs text-ink-muted">
                  From {parts.total} parts · {parts.graded} graded
                </p>
              )}
              {parts && r.showParts && (
                <PartsEditor
                  row={r}
                  label={label}
                  summary={parts}
                  onChange={(next) => patch(r.id, { parts: next })}
                  onRemoveBreakdown={() => patch(r.id, { parts: undefined, showParts: false })}
                />
              )}
            </div>
          );
        })}
        </div>
      </div>

      <CardFooter addLabel="Add row" onAdd={add} onReset={reset} />
    </section>
  );
}
