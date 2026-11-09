import { useState, useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { LeftSidebar, RightSidebar, MobileDrawer } from './components/Sidebar';
import { GradeScaleReference } from './components/ui';
import CourseGradeCalc from './components/CourseGradeCalc';
import TermGpaCalc from './components/TermGpaCalc';
import CumulativeGpaCalc from './components/CumulativeGpaCalc';
import { TUTORIAL_URL, FEEDBACK_URL } from './data/links';

const TABS = [
  { id: 'course', label: 'Course Grade', Component: CourseGradeCalc },
  { id: 'term', label: 'Term GPA', Component: TermGpaCalc },
  { id: 'cumulative', label: 'Cumulative GPA', Component: CumulativeGpaCalc },
];

export default function App() {
  const [storedTab, setActiveTab] = useLocalStorage('active-calc-tab', 'term');
  const activeTab = TABS.some((t) => t.id === storedTab) ? storedTab : 'term';
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const { Component } = TABS.find((t) => t.id === activeTab);

  return (
    <div className="flex min-h-screen flex-col">
      <Header onOpenMenu={() => setMenuOpen(true)} />
      <MobileDrawer open={menuOpen} onClose={closeMenu} />

      <div className="flex flex-1 items-stretch">
        <LeftSidebar />

        <main className="min-w-0 flex-1 px-4 pt-6 pb-16 sm:px-7 lg:px-12 lg:pt-8">
          <div className="mx-auto max-w-[860px]">
            <TabBar active={activeTab} onChange={setActiveTab} />
            <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
              <Component key={activeTab} />
            </div>
            <GradeScaleReference />
          </div>
        </main>

        <RightSidebar />
      </div>

      <footer className="border-t border-[#e0e0e0] bg-sidebar px-4 py-4 text-center text-sm text-ink-muted">
        <p>Results are estimates — your official GPA is on your transcript.</p>
        <p className="mt-1">© {new Date().getFullYear()} First-Year Engineering Office · Toronto Metropolitan University</p>
      </footer>
    </div>
  );
}

function Header({ onOpenMenu }) {
  return (
    <header className="sticky top-0 z-40 flex min-h-20 items-center justify-between gap-4 bg-brand px-4 py-3 shadow-[0_2px_12px_rgba(60,0,60,0.13)] sm:px-8">
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <img src={`${import.meta.env.BASE_URL}GPA_Calc.png`} alt="" className="h-12 w-12 shrink-0 rounded-md object-contain sm:h-[60px] sm:w-[60px]" />
        <span className="truncate text-lg font-bold tracking-[0.3px] text-white sm:text-[1.4rem]">FYEO GPA Calculator</span>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <a href={TUTORIAL_URL} target="_blank" rel="noopener noreferrer" className="btn btn-yellow hidden px-[18px] py-2.5 text-[0.95rem] md:inline-flex">
          ▶ Video Tutorial
        </a>
        <a href={FEEDBACK_URL} target="_blank" rel="noopener noreferrer" className="btn btn-yellow hidden px-[18px] py-2.5 text-[0.95rem] lg:inline-flex">
          💬 Share Feedback
        </a>
        <button type="button" onClick={onOpenMenu}
          className="btn bg-white/15 px-3 py-2.5 text-white xl:hidden" aria-label="Open resources menu">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="hidden sm:inline">Resources</span>
        </button>
      </div>
    </header>
  );
}

// Styled like the course planner's stepper: pills with numbered circles.
function TabBar({ active, onChange }) {
  const onKeyDown = (e) => {
    const i = TABS.findIndex((t) => t.id === active);
    const next = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : null;
    if (next === null) return;
    const tab = TABS[(next + TABS.length) % TABS.length];
    onChange(tab.id);
    document.getElementById(`tab-${tab.id}`)?.focus();
  };

  return (
    <div role="tablist" aria-label="Calculator" onKeyDown={onKeyDown}
      className="relative mb-7 flex justify-between gap-2 before:absolute before:inset-x-[8%] before:top-1/2 before:h-0.5 before:bg-black/[0.08]">
      {TABS.map((tab, i) => {
        const selected = tab.id === active;
        return (
          <button key={tab.id} id={`tab-${tab.id}`} type="button" role="tab"
            aria-selected={selected} aria-controls={`panel-${tab.id}`} tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={`relative flex cursor-pointer flex-col items-center gap-1 rounded-3xl bg-white px-2 py-1 text-xs sm:flex-row sm:gap-2.5 sm:px-3 sm:text-base ${
              selected ? 'font-bold text-accent' : 'text-[#737373] hover:text-ink'}`}>
            <span className={`flex h-8 w-8 items-center justify-center rounded-full bg-accent text-white transition sm:h-10 sm:w-10 ${
              selected ? 'scale-110 opacity-100 shadow-[0_4px_12px_rgba(160,9,215,0.3)]' : 'opacity-45'}`}>
              {i + 1}
            </span>
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
