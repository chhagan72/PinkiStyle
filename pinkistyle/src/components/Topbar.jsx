// topbar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Topbar({
  language,
  setLanguage,
  darkMode,
  setDarkMode,
  setSidebarOpen,
  setMobileOpen,
  showProfile,
  onLogout,
  t, // translations
  isAdmin,
  user,
  hideCart,
  MyOrders, // <-- user contains avatarUrl, firstName, lastName, email
}) {
  const navigate = useNavigate();
  const { cart } = useCart(); // get cart items
  const count = cart.reduce((sum, item) => sum + item.qty, 0);

  const getInitials = (u) => {
    if (!u) return "U";
    const f = u.firstName?.trim()?.charAt(0) ?? "";
    const l = u.lastName?.trim()?.charAt(0) ?? "";
    if (f || l) return (f + l).toUpperCase();
    if (u.email) {
      const local = u.email.split("@")[0] || "";
      return local.slice(0, 2).toUpperCase() || "U";
    }
    return "U";
  };

  const initials = getInitials(user);

  const API_BASE = "http://localhost:5000"; // adjust if backend is deployed

  return (
    <header className="topbar d-flex align-items-center justify-content-between px-3">
      <div className="d-flex align-items-center gap-2">
        {/* Mobile menu button */}
        {showProfile && (
          <button
            className="btn btn-ghost p-2 d-lg-none"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            ☰
          </button>
        )}

        {/* Desktop sidebar toggle */}
        {showProfile && (
          <button
            className="btn btn-ghost p-2 d-none d-lg-inline"
            onClick={() => setSidebarOpen((s) => !s)}
          >
            ≡
          </button>
        )}

        {/* Brand */}
        <div className="brand d-flex align-items-center">
          <div className="logo me-2">🧾</div>
          <div className="brand-text">
            <div className="brand-title fw-bold">PinkiStyle</div>
            <small className="fw-bold">{t.tagline}</small>
          </div>
        </div>
      </div>

      <div className="d-flex align-items-center gap-2">
        {/* Cart Button */}
        {!hideCart && (
          <button
            className="btn btn-sm btn-outline-primary position-relative"
            onClick={() => navigate("/cart")}
          >
            🛒 Cart
            {count > 0 && (
              <span className="badge bg-danger position-absolute top-0 start-100 translate-middle">
                {count}
              </span>
            )}
          </button>
        )}
        {/* Language */}
        {!isAdmin && (
          <div className="dropdown">
            <button
              className="btn btn-sm btn-outline-secondary dropdown-toggle"
              data-bs-toggle="dropdown"
            >
              {
                t[
                  `lang${
                    language === "EN"
                      ? "English"
                      : language === "HI"
                      ? "Hindi"
                      : "Marathi"
                  }`
                ]
              }
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => setLanguage("EN")}
                >
                  {t.langEnglish}
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => setLanguage("HI")}
                >
                  {t.langHindi}
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => setLanguage("MR")}
                >
                  {t.langMarathi}
                </button>
              </li>
            </ul>
          </div>
        )}

        {/* Theme toggle */}
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() => setDarkMode((d) => !d)}
        >
          {darkMode ? "🌙" : "☀️"}
        </button>

        {/* Profile only when logged in */}
        {showProfile && (
          <div className="dropdown">
            <button
              className="btn btn-sm btn-outline-secondary rounded-circle p-0"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              aria-label="User menu"
            >
              {user?.avatarUrl ? (
                <img
                  src={`${API_BASE}${user.avatarUrl}`}
                  alt="avatar"
                  className="profile-avatar-img"
                />
              ) : (
                <span className="profile-avatar">{initials}</span>
              )}
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => navigate("/profile")}
                >
                  {t.profile}
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => navigate("/settings")}
                >
                  {t.settings}
                </button>
              </li>
              <li>
                {!MyOrders && (
                  <button
                    className="dropdown-item"
                    onClick={() => navigate("/my-orders")}
                  >
                    My Orders
                  </button>
                )}
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <button className="dropdown-item" onClick={onLogout}>
                  {t.logout}
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>

      <style>{`
        .topbar {
          height: 64px;
          background: var(--card);
          border-bottom: 1px solid rgba(0,0,0,0.05);
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1050;
        }
        .topbar .btn-ghost {
          background: transparent;
          border: none;
          font-size: 20px;
          color: var(--text-primary);
        }
        .profile-avatar {
          display: inline-block;
          min-width: 32px;
          height: 32px;
          line-height: 32px;
          border-radius: 50%;
          background: var(--accent);
          color: #fff;
          text-align: center;
          font-weight: 700;
        }
        .profile-avatar-img {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }
      `}</style>
    </header>
  );
}
