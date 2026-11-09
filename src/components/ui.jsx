import { GRADE_SCALE } from '../lib/grades';

export function TrashIcon({ className = 'h-5 w-5' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  );
}

export function CardHeader({ title, description, children }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="mt-1 text-white/90">{description}</p>
      </div>
      {children}
    </div>
  );
}

export function Stat({ label, value, sub, tone = 'text-accent', className = '' }) {
  return (
    <div className={`stat ${className}`}>
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${tone}`} aria-live="polite">{value}</div>
      {sub && <div className="mt-1 text-sm text-ink-muted">{sub}</div>}
    </div>
  );
}

export function Callout({ tone = 'info', children }) {
  return (
    <div className={`callout callout-${tone}`} role="status">
      {children}
    </div>
  );
}

export function CardFooter({ addLabel, onAdd, onReset }) {
  return (
    <div className="mt-6 flex items-center justify-between gap-4">
      <button type="button" onClick={onAdd} className="btn btn-yellow">
        <span aria-hidden="true">+</span> {addLabel}
      </button>
      <button type="button" onClick={onReset} className="btn-ghost">
        Reset
      </button>
    </div>
  );
}

export function GradeScaleReference() {
  return (
    <details className="mt-8 rounded-xl bg-white p-5 shadow-card [&[open]>summary]:mb-4">
      <summary className="cursor-pointer font-bold">TMU grading scale (4.33)</summary>
      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
        {GRADE_SCALE.map((g) => (
          <div key={g.letter} className="flex justify-between border-t border-[#ececf3] py-1.5">
            <span>
              <span className="font-bold">{g.letter}</span>{' '}
              <span className="text-ink-muted">{g.min}–{g.max}%</span>
            </span>
            <span className="font-semibold tabular-nums">{g.points.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </details>
  );
}
