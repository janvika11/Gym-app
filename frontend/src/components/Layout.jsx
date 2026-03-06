import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import './Layout.css';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/members', label: 'Members' },
  { to: '/fees', label: 'Fees & Plans' },
  { to: '/reminders', label: 'WhatsApp' },
  { to: '/attendance', label: 'Attendance' },
  { to: '/settings', label: 'Settings' },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  const currentTitle =
    navItems.find((n) => location.pathname.startsWith(n.to))?.label || 'Dashboard';

  return (
    <div className="layout">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <span className="sidebar-logo-mark">G</span>
          </div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-title">Gym Admin</span>
            <span className="sidebar-brand-sub">Fitness Hub</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''} ${
                  item.to === '/reminders' ? 'sidebar-link-whatsapp' : ''
                }`
              }
              onClick={closeSidebar}
            >
              <span>{item.label}</span>
              {item.to === '/reminders' && (
                <span className="sidebar-badge">WA</span>
              )}
            </NavLink>
          ))}
        </nav>
        <button type="button" className="sidebar-logout" onClick={logout}>
          Logout
        </button>
      </aside>

      <main className="main">
        <header className="layout-header">
          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setSidebarOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
          <h1 className="layout-title">{currentTitle}</h1>
          <button type="button" className="layout-logout" onClick={logout}>
            Logout
          </button>
        </header>
        <div className="main-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
