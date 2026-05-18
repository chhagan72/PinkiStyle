import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar({
  sidebarOpen,
  mobileOpen,
  setMobileOpen,
  menuItems,
  openMenus,
  toggleMenu,
}) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`sidebar ${sidebarOpen ? "open" : "closed"} d-none d-lg-block`}
      >
        <div className="sidebar-inner scroll-hide">
          <nav className="menu px-2">
            {menuItems.map((m, idx) => (
              <div key={m.title} className="menu-block">
                <button
                  className="menu-btn d-flex align-items-center w-100"
                  onClick={() => toggleMenu(idx)}
                >
                  <span className="menu-icon me-2">{m.icon}</span>
                  <span className="menu-title flex-grow-1 text-start">
                    {m.title}
                  </span>
                  <span className={`chev ${openMenus[idx] ? "open" : ""}`}>
                    ▾
                  </span>
                </button>
                <div
                  className="submenu"
                  style={{
                    maxHeight: openMenus[idx]
                      ? `${m.items.length * 44}px`
                      : "0px",
                  }}
                >
                  {m.items.map((it) => (
                    <NavLink
                      key={it.path}
                      to={it.path}
                      className={({ isActive }) =>
                        `submenu-item ${isActive ? "active" : ""}`
                      }
                    >
                      {it.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <div className={`mobile-sidebar ${mobileOpen ? "open" : ""} d-lg-none`}>
        <div
          className="mobile-sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
        />
        <div className="mobile-sidebar-panel scroll-hide">
          <nav className="menu px-2">
            {menuItems.map((m, idx) => (
              <div key={m.title} className="menu-block">
                <button
                  className="menu-btn d-flex align-items-center w-100"
                  onClick={() => toggleMenu(idx)}
                >
                  <span className="menu-icon me-2">{m.icon}</span>
                  <span className="menu-title flex-grow-1 text-start">
                    {m.title}
                  </span>
                  <span className={`chev ${openMenus[idx] ? "open" : ""}`}>
                    ▾
                  </span>
                </button>
                <div
                  className="submenu"
                  style={{
                    maxHeight: openMenus[idx]
                      ? `${m.items.length * 44}px`
                      : "0px",
                  }}
                >
                  {m.items.map((it) => (
                    <NavLink
                      key={it.path}
                      to={it.path}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `submenu-item ${isActive ? "active" : ""}`
                      }
                    >
                      {it.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </div>

      <style>{`
        /* Scrollbar Hide Utility */
        .scroll-hide {
          overflow-y: auto;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
        }
        .scroll-hide::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }

        /* Desktop Sidebar */
        .sidebar {
          position: fixed;
          left: 0;
          top: 64px;
          bottom: 0;
          width: 260px;
          background: var(--sidebar-bg);
          border-right: 1px solid rgba(0,0,0,0.05);
          transition: transform .3s ease;
          z-index: 1035;
        }
        .sidebar.closed { transform: translateX(-100%); }
        .sidebar-inner {
          height: 100%;
          padding-bottom: 20px;
        }
        .menu-block .menu-btn{
          padding: 8px 5px;
        }
        .menu-block .menu-btn:hover{
          background: rgba(255, 255, 255, 0.81);
        }
        .submenu { overflow: hidden; transition: max-height .3s ease; }
        .submenu-item { display: block; padding: 10px 18px; text-decoration: none; color: var(--sidebar-text); }
        .submenu-item.active { background: rgba(13,110,253,0.12); color: var(--accent); font-weight: 600; }

        /* Mobile Sidebar */
        .mobile-sidebar { position: fixed; inset: 0; z-index: 1040; pointer-events: none; }
        .mobile-sidebar.open { pointer-events: auto; }
        .mobile-sidebar-backdrop { --background); position: absolute; inset: 0; opacity: 1; }
        .mobile-sidebar-panel { 
          background: var(--sidebar-bg); 
          width: 280px; 
          height: calc(100% - 64px); 
          position: absolute; 
          left: 0; 
          top: 64px; /* Under topbar */
          transition: transform .3s ease; 
          padding-bottom: 20px;
        }
        .mobile-sidebar:not(.open) .mobile-sidebar-panel { transform: translateX(-100%); }
      `}</style>
    </>
  );
}
