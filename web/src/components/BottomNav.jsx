import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/', label: 'Zuhause', icon: 'home', end: true },
  { to: '/raeume', label: 'Räume', icon: 'rooms' },
  { to: '/doktor', label: 'Doktor', icon: 'doctor' },
  { to: '/einstellungen', label: 'Mehr', icon: 'more' }
];

const ICONS = {
  home: <path d="M4 12l8-7 8 7M6 10v9h12v-9" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
  rooms: <path d="M4 5h7v7H4zM13 5h7v4h-7zM13 12h7v7h-7zM4 15h7v4H4z" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinejoin="round" />,
  doctor: <path d="M12 3v6M9 6h6M6 12c0 5 3.5 8 6 9 2.5-1 6-4 6-9a4 4 0 00-6-3.4A4 4 0 006 12z" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
  more: <path d="M5 12h.01M12 12h.01M19 12h.01" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
};

export function BottomNav() {
  return (
    <nav className="bottom-nav">
      {TABS.map((t) => (
        <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => 'nav-tab' + (isActive ? ' active' : '')}>
          <svg className="glyph" viewBox="0 0 24 24">{ICONS[t.icon]}</svg>
          {t.label}
        </NavLink>
      ))}
    </nav>
  );
}
