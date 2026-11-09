import { useEffect } from 'react';
import {
  leftGroups, rightGroups, FEEDBACK_URL, TUTORIAL_URL, GOOGLE_PLAY_URL, APP_STORE_URL,
} from '../data/links';

const asset = (file) => `${import.meta.env.BASE_URL}${file}`;

function LinkGroup({ group }) {
  return (
    <section className="sidebar-card">
      <h2 className="sidebar-heading">
        <span aria-hidden="true">{group.icon}</span>
        {group.title}
      </h2>
      <div className="flex flex-col gap-2.5">
        {group.links.map((link) => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn btn-${group.variant} w-full py-2.5 text-[0.93rem]`}
          >
            {link.label}
          </a>
        ))}
      </div>
    </section>
  );
}

function AppDownloadCard() {
  return (
    <section className="sidebar-card">
      <h2 className="sidebar-heading">
        <span aria-hidden="true">📱</span>FYEng Mobile App
      </h2>
      <div className="grid grid-cols-2 gap-2">
        <a href={GOOGLE_PLAY_URL} target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-[1.03]">
          <img src={asset('GetItOnGooglePlay_Badge_Web_color_English.svg')} alt="Get it on Google Play" className="h-10 w-full object-contain" />
        </a>
        <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-[1.03]">
          <img src={asset('Black_logo_app_store.svg')} alt="Download on the App Store" className="h-10 w-full object-contain" />
        </a>
      </div>
    </section>
  );
}

function FeedbackCard() {
  return (
    <section className="sidebar-card">
      <h2 className="sidebar-heading">
        <span aria-hidden="true">💬</span>Feedback
      </h2>
      <p className="mb-3 text-sm text-ink-muted">Help us improve the calculator by sharing your thoughts.</p>
      <a href={FEEDBACK_URL} target="_blank" rel="noopener noreferrer" className="btn btn-yellow w-full py-2.5 text-[0.93rem]">
        Share Feedback
      </a>
    </section>
  );
}

const asideClass = 'hidden xl:block w-[290px] shrink-0 bg-sidebar px-5 py-7';

export function LeftSidebar() {
  return (
    <aside className={`${asideClass} border-r border-[#e0e0e0]`} aria-label="Academic resources">
      {leftGroups.map((g) => <LinkGroup key={g.title} group={g} />)}
      <img src={asset('FYEO_Logo_Black.png')} alt="First-Year Engineering Office" className="w-full rounded-xl bg-white p-3 shadow-card" />
    </aside>
  );
}

export function RightSidebar() {
  return (
    <aside className={`${asideClass} border-l border-[#e0e0e0]`} aria-label="Student support">
      {rightGroups.map((g) => <LinkGroup key={g.title} group={g} />)}
      <AppDownloadCard />
      <FeedbackCard />
    </aside>
  );
}

export function MobileDrawer({ open, onClose }) {
  // Escape to close + stop the page scrolling behind the drawer.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex xl:hidden" role="dialog" aria-modal="true" aria-label="Resources menu">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-xs flex-col bg-sidebar shadow-2xl animate-fade-in">
        <div className="flex h-16 items-center justify-between bg-brand px-4">
          <span className="text-lg font-bold text-white">Resources</span>
          <button type="button" onClick={onClose} className="rounded-md p-2 text-white hover:bg-white/15" aria-label="Close menu" autoFocus>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <a href={TUTORIAL_URL} target="_blank" rel="noopener noreferrer" className="btn btn-blue mb-6 w-full">
            ▶ Watch Video Tutorial
          </a>
          {[...leftGroups, ...rightGroups].map((g) => <LinkGroup key={g.title} group={g} />)}
          <AppDownloadCard />
          <FeedbackCard />
        </div>
      </div>
    </div>
  );
}
