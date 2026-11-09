import { useLocalStorage } from '../hooks/useLocalStorage';
import { gradeForPercent, toNum, tidy } from '../lib/grades';
import { newId } from '../lib/id';
import { CardHeader, Stat, Callout, CardFooter, TrashIcon } from './ui';
import { confirmReset } from '../lib/confirm';

const DEFAULT_ROWS = ['Assignment', 'Quizzes', 'Tutorials', 'Labs', 'Projects', 'Midterms', 'Final Exam'];
const makeDefaults = () => DEFAULT_ROWS.map((name) => ({ id: newId(), name, grade: '', weight: '' }));

const ROW_GRID = 'grid grid-cols-[1fr_1fr_2.5rem] items-end gap-3 sm:grid-cols-[1fr_8rem_8rem_2.5rem] sm:items-center';

export default function CourseGradeCalc() {
  const [targetGrade, setTargetGrade] = useLocalStorage('course-target', '');
  const [rows, setRows] = useLocalStorage('course-assignments', makeDefaults);

  const update = (id, field, value) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  const add = () => setRows((prev) => [...prev, { id: newId(), name: '', grade: '', weight: '' }]);
  const remove = (id) => setRows((prev) => prev.filter((r) => r.id !== id));
  const reset = () => {
    const hasData = targetGrade !== '' || rows.some((r) => r.grade !== '' || r.weight !== '');
    if (!confirmReset(hasData)) return;
    setTargetGrade('');
    setRows(makeDefaults());
  };

  // --- Math ---
  let totalWeight = 0;
  let completedWeight = 0;
  let earned = 0; // percentage points of the final grade already locked in
  for (const r of rows) {
    const w = toNum(r.weight);
    const g = toNum(r.grade);
    if (w === null) continue;
    totalWeight += w;
    if (g !== null) {
      completedWeight += w;
      earned += g * (w / 100);
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
        </p>
      </div>

      <div className="panel mt-6">
        <div className={`${ROW_GRID} hidden px-1 pb-2 text-sm font-bold text-ink-muted sm:grid`}>
          <span>Assessment</span><span>Grade (%)</span><span>Weight (%)</span><span />
        </div>
        <div className="divide-y divide-[#ececf3]">
        {rows.map((r, i) => {
          const label = r.name || `Row ${i + 1}`;
          return (
            <div key={r.id} className={`${ROW_GRID} px-1 py-3`}>
              <label className="col-span-3 sm:col-span-1">
                <span className="field-label sm:hidden">Assessment</span>
                <input type="text" value={r.name} placeholder="e.g. Lab 1" aria-label={`Assessment name, row ${i + 1}`}
                  onChange={(e) => update(r.id, 'name', e.target.value)} onFocus={(e) => e.target.select()} className="field" />
              </label>
              <label>
                <span className="field-label sm:hidden">Grade (%)</span>
                <input type="number" inputMode="decimal" min="0" value={r.grade} placeholder="—" aria-label={`${label} grade`}
                  aria-invalid={toNum(r.grade) !== null && toNum(r.grade) < 0}
                  onChange={(e) => update(r.id, 'grade', e.target.value)} onFocus={(e) => e.target.select()} className="field" />
              </label>
              <label>
                <span className="field-label sm:hidden">Weight (%)</span>
                <input type="number" inputMode="decimal" min="0" max="100" value={r.weight} placeholder="—" aria-label={`${label} weight`}
                  aria-invalid={toNum(r.weight) !== null && (toNum(r.weight) < 0 || toNum(r.weight) > 100)}
                  onChange={(e) => update(r.id, 'weight', e.target.value)} onFocus={(e) => e.target.select()} className="field" />
              </label>
              <button type="button" onClick={() => remove(r.id)} disabled={rows.length === 1}
                className="icon-btn" aria-label={`Remove ${label}`}>
                <TrashIcon />
              </button>
            </div>
          );
        })}
        </div>
      </div>

      <CardFooter addLabel="Add row" onAdd={add} onReset={reset} />
    </section>
  );
}
